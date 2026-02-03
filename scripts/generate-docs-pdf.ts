import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

async function generatePDF() {
    const mdPath = path.join(process.cwd(), 'ProjectOverview.md');
    const pdfPath = path.join(process.cwd(), 'ProjectOverview.pdf');

    if (!fs.existsSync(mdPath)) {
        console.error('ProjectOverview.md not found!');
        return;
    }

    const content = fs.readFileSync(mdPath, 'utf-8');
    const doc = new jsPDF();

    // Basic PDF drawing logic
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Scrap Project Overview', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const splitText = doc.splitTextToSize(content, pageWidth - margin * 2);

    for (const line of splitText) {
        if (y + 10 > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        // Very basic styling for headers in MD content
        if (line.startsWith('# ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            y += 5;
        } else if (line.startsWith('## ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            y += 3;
        } else if (line.startsWith('### ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
        }

        doc.text(line, margin, y);
        y += 7;
    }

    const arrayBuffer = doc.output('arraybuffer');
    fs.writeFileSync(pdfPath, Buffer.from(arrayBuffer));

    console.log(`PDF generated at: ${pdfPath}`);
}

generatePDF().catch(console.error);
