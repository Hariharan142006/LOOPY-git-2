const fs = require('fs');
const path = require('path');

const mappings = {
  "'/account-settings'": "'AccountSettings'",
  "'/edit-profile'": "'EditProfile'",
  "'/language-notifications'": "'LanguageNotifications'",
  "'/refer-earn'": "'ReferEarn'",
  "'/login'": "'Login'",
  "'/signup'": "'Signup'",
  "'/book'": "'Book'",
  "'/history'": "'History'",
  "'/rates'": "'Rates'",
  "'/notifications'": "'Notifications'",
  "'/manage-addresses'": "'ManageAddresses'",
  "'/feedback'": "'Feedback'",
  "'/legal'": "'Legal'",
  "'/help-support'": "'HelpSupport'",
};

const dynamicMappings = [
    { pattern: /\/track\/\$\{([^}]+)\}/g, screen: 'Track' },
    { pattern: /\/track-route\/\$\{([^}]+)\}/g, screen: 'TrackRoute' },
    { pattern: /\/weigh\/\$\{([^}]+)\}/g, screen: 'Weigh' },
    { pattern: /\/invoice\/\$\{([^}]+)\}/g, screen: 'Invoice' },
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
      
      // Fix navigation.navigate('/path')
      Object.keys(mappings).forEach(pathKey => {
        const regex = new RegExp(pathKey.replace(/['"]/g, "['\"/]?"), 'g'); // Handle cases like '/path' or 'path'
        if (regex.test(content)) {
          content = content.replace(regex, mappings[pathKey]);
          changed = true;
        }
      });

      // Fix dynamic paths: navigation.navigate(`/track/${item.id}`) -> navigation.navigate('Track', { id: item.id })
      dynamicMappings.forEach(m => {
        if (m.pattern.test(content)) {
          content = content.replace(m.pattern, (match, idVar) => {
            return `${m.screen}', { id: ${idVar} }`; // Note the single quote at start is preserved from original string usually
          });
          // Fix the leading quote that might be left over: navigation.navigate(`Track', { id: item.id })
          content = content.replace(new RegExp("navigate\\(`" + m.screen, 'g'), `navigate('${m.screen}`);
          content = content.replace(new RegExp("navigate\\('" + m.screen, 'g'), `navigate('${m.screen}`);
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
