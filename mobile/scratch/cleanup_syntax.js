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

      // Fix double closing parentheses after navigate or replace
      // Match: navigate('ScreenName')) or navigate('Screen', { ... }))
      // But avoid matching legitimate cases like onPress={() => navigate('...') }
      
      // Pattern: navigate('...', ...) followed by an extra )
      const pattern = /navigate\((['"`].*?['"`](,\s*\{.*?\})?)\)\)/g;
      if (pattern.test(content)) {
          content = content.replace(pattern, 'navigate($1)');
          changed = true;
      }
      
      const patternReplace = /replace\((['"`].*?['"`](,\s*\{.*?\})?)\)\)/g;
      if (patternReplace.test(content)) {
          content = content.replace(patternReplace, 'replace($1)');
          changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned up double parentheses in ${filePath}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
