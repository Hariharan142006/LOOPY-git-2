import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadInvoice = (booking: any) => {
    if (!booking) return;

    const doc = new jsPDF();
    const invoiceId = booking.id.slice(0, 8).toUpperCase();
    const date = new Date(booking.createdAt).toLocaleDateString('en-IN');

    // Branding & Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green-600
    doc.text('Loopy', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Instant Cash for Scrap', 14, 25);

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('INVOICE', 140, 20);

    doc.setFontSize(10);
    doc.text(`Invoice ID: #${invoiceId}`, 140, 27);
    doc.text(`Date: ${date}`, 140, 32);

    // Divider
    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    // Customer & Agent Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', 14, 50);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(booking.user?.name || 'N/A', 14, 57);
    doc.text(booking.user?.phone || 'N/A', 14, 62);
    doc.text(`${booking.address?.street || ''}`, 14, 67);
    doc.text(`${booking.address?.city || ''}`, 14, 72);

    if (booking.agent) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Agent Details', 120, 50);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.agent.name || 'N/A', 120, 57);
        doc.text(booking.agent.phone || 'N/A', 120, 62);
    }

    // Items Table
    const tableData = (booking.items || []).map((bi: any) => [
        bi.item?.name || 'Item',
        `₹${Math.floor(bi.priceAtBooking || bi.item?.currentPrice || 0).toFixed(0)}`,
        `${bi.quantity || 0} ${bi.item?.unit || 'kg'}`,
        `₹${Math.floor((bi.priceAtBooking || bi.item?.currentPrice || 0) * (bi.quantity || 0)).toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Item Description', 'Rate', 'Quantity', 'Total']],
        body: tableData,
        headStyles: { fillColor: [22, 163, 74] }, // Green-600
        foot: [[
            { content: 'Grand Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: `₹${Math.floor(booking.totalAmount || 0).toFixed(0)}`, styles: { fontStyle: 'bold', fillColor: [240, 253, 244] } }
        ]],
        theme: 'striped',
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for choosing Loopy! Together, let\'s make India cleaner.', 14, finalY + 10);
    doc.text('This is a computer-generated invoice.', 14, finalY + 15);

    // Save PDF
    doc.save(`Invoice_${invoiceId}.pdf`);
};
