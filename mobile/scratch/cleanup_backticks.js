const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      // Fix stray backticks from failed replacements: }` as any) -> } as any)
      if (content.includes('}` as any)')) {
          content = content.replace(/\}` as any\)/g, '} as any)');
          changed = true;
      }
      
      // Fix cases where it's ScreenName')` as any)
      if (content.includes("')` as any)")) {
          content = content.replace(/'\)` as any\)/g, "') as any)");
          changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned up stray backticks in ${filePath}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
