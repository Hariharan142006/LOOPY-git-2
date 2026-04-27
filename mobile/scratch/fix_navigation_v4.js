const fs = require('fs');
const path = require('path');

const mappings = {
  "/account-settings": "AccountSettings",
  "/edit-profile": "EditProfile",
  "/language-notifications": "LanguageNotifications",
  "/refer-earn": "ReferEarn",
  "/login": "Login",
  "/signup": "Signup",
  "/book": "Book",
  "/history": "History",
  "/rates": "Rates",
  "/notifications": "Notifications",
  "/manage-addresses": "ManageAddresses",
  "/feedback": "Feedback",
  "/legal": "Legal",
  "/help-support": "HelpSupport",
  "/(tabs)": "Main",
};

const dynamicMappings = [
    { pattern: /[`'"]\/track\/\$\{([^}]+)\}[`'"]/g, screen: 'Track' },
    { pattern: /[`'"]\/track-route\/\$\{([^}]+)\}[`'"]/g, screen: 'TrackRoute' },
    { pattern: /[`'"]\/weigh\/\$\{([^}]+)\}[`'"]/g, screen: 'Weigh' },
    { pattern: /[`'"]\/invoice\/\$\{([^}]+)\}[`'"]/g, screen: 'Invoice' },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      
      // Fix router.replace/push to navigation.replace/navigate
      if (content.includes('router.replace(') || content.includes('router.push(')) {
          content = content.replace(/router\.replace\(/g, 'navigation.replace(');
          content = content.replace(/router\.push\(/g, 'navigation.navigate(');
          changed = true;
      }

      // Fix navigation calls with static paths
      Object.keys(mappings).forEach(pathKey => {
        const pattern = new RegExp(`navigate\\(['"\`]${pathKey}['"\`]`, 'g');
        if (pattern.test(content)) {
          content = content.replace(pattern, `navigate('${mappings[pathKey]}')`);
          changed = true;
        }
        const patternReplace = new RegExp(`replace\\(['"\`]${pathKey}['"\`]`, 'g');
        if (patternReplace.test(content)) {
          content = content.replace(patternReplace, `replace('${mappings[pathKey]}')`);
          changed = true;
        }
      });

      // Fix dynamic paths: navigation.navigate(`/track/${item.id}`) -> navigation.navigate('Track', { id: item.id })
      dynamicMappings.forEach(m => {
        if (m.pattern.test(content)) {
          content = content.replace(m.pattern, (match, idVar) => {
            return `'${m.screen}', { id: ${idVar} }`; 
          });
          changed = true;
        }
      });
      
      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated navigation in ${filePath}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
