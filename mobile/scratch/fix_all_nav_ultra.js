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

      // Robust regex for unquoted navigation targets
      // Handles /login, /notifications, /(tabs), etc.
      // Matches: navigation.navigate(/something)
      content = content.replace(/navigation\.(navigate|replace)\(\/([a-zA-Z0-9_\-\(\)]+)(\)|,)/g, (match, method, target, suffix) => {
          let screen = target;
          if (target === 'login') screen = 'Login';
          if (target === 'signup') screen = 'Signup';
          if (target === '(tabs)') screen = 'Main';
          if (target === 'notifications') screen = 'Notifications';
          if (target === 'history') screen = 'History';
          if (target === 'profile') screen = 'Main'; // Should be handled with screen: 'profile' elsewhere but this is a fallback
          
          // Capitalize if it's a simple name and not already capitalized
          if (/^[a-z]/.test(screen) && !screen.includes('/')) {
              screen = screen.charAt(0).toUpperCase() + screen.slice(1);
          }
          
          return `navigation.${method}('${screen}'${suffix}`;
      });

      if (content !== original) {
        fs.writeFileSync(f, content);
        console.log(`Fixed ${f}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
