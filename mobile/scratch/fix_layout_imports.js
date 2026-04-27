const fs = require('fs');
const path = require('path');

const layoutPath = path.join(process.cwd(), 'app', '_layout.tsx');
let content = fs.readFileSync(layoutPath, 'utf8');

const mappings = {
  Login: './login',
  Signup: './signup',
  Book: './book',
  History: './history',
  Notifications: './notifications',
  Rates: './rates',
  HelpSupport: './help-support',
  Legal: './legal',
  AccountSettings: './account-settings',
  EditProfile: './edit-profile',
  ManageAddresses: './manage-addresses',
  Feedback: './feedback',
  ReferEarn: './refer-earn',
  LanguageNotifications: './language-notifications',
  Track: './track/[id]',
  TrackRoute: './track-route/[id]',
  Weigh: './weigh/[id]',
  Invoice: './invoice/[id]',
};

// Fix the broken imports like import LoginScreen from '.'Login';
Object.keys(mappings).forEach(key => {
    const pattern = new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]\\.'${key}['"]`, 'g');
    if (pattern.test(content)) {
        content = content.replace(pattern, `import $1 from '${mappings[key]}'`);
    }
});

fs.writeFileSync(layoutPath, content);
console.log('Fixed imports in _layout.tsx');
