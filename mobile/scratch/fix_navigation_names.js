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

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      
      // Fix router.replace/push
      if (content.includes('router.replace(') || content.includes('router.push(')) {
          content = content.replace(/router\.replace\(/g, 'navigation.replace(');
          content = content.replace(/router\.push\(/g, 'navigation.navigate(');
          changed = true;
      }

      // Fix navigation.navigate('/path')
      Object.keys(mappings).forEach(pathKey => {
        if (content.includes(pathKey)) {
          content = content.replace(new RegExp(pathKey, 'g'), mappings[pathKey]);
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
