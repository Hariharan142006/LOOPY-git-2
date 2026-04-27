const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const f = path.join(dir, file);
    if (fs.statSync(f).isDirectory()) {
      walk(f);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(f, 'utf8');
      const original = content;

      // Fix unquoted navigation calls
      content = content.replace(/navigation\.(navigate|replace)\(\/login\)/g, "$1('Login')");
      content = content.replace(/navigation\.(navigate|replace)\(\/\(tabs\)\)/g, "$1('Main')");
      content = content.replace(/navigation\.(navigate|replace)\(\/signup\)/g, "$1('Signup')");
      content = content.replace(/navigation\.(navigate|replace)\(\/history\)/g, "$1('History')");
      content = content.replace(/navigation\.(navigate|replace)\(\/profile\)/g, "$1('Main', { screen: 'profile' })");
      
      // Fix cases where it's (/login) with params or as any
      content = content.replace(/navigation\.replace\(\/login\) as any\)/g, "navigation.replace('Login')");
      content = content.replace(/navigation\.navigate\(\/login\) as any\)/g, "navigation.navigate('Login')");
      content = content.replace(/navigation\.navigate\(\/\(tabs\)\) as any\)/g, "navigation.navigate('Main')");
      content = content.replace(/navigation\.replace\(\/\(tabs\)\) as any\)/g, "navigation.replace('Main')");

      if (content !== original) {
        fs.writeFileSync(f, content);
        console.log(`Fixed ${f}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
