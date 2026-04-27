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

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      // Fix all corrupted strings in API calls
      Object.keys(mappings).forEach(pathKey => {
          const screenName = mappings[pathKey];
          // Example: /api'Notifications' -> /api/notifications
          const corrupted = `'${screenName}'`;
          if (content.includes(corrupted)) {
              // Check if it's likely an API path (preceded by /api or something)
              // But actually it's safer to just replace it with the pathKey since it was originally that.
              content = content.replace(new RegExp(`'${screenName}'`, 'g'), pathKey);
              changed = true;
          }
      });

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed corrupted strings in ${filePath}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
