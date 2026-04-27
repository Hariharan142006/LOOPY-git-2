const fs = require('fs');
const path = require('path');

const filesToFix = [
  {
    path: 'app/weigh/[id].tsx',
    search: "navigation.replace('/(tabs)')",
    replace: "navigation.replace('Main')"
  },
  {
    path: 'app/book.tsx',
    search: "navigation.replace('/(tabs)' as any)",
    replace: "navigation.replace('Main')"
  },
  {
    path: 'app/onboarding/tutorial.tsx',
    search: "navigation.replace(/(tabs),",
    replace: "navigation.replace('Main',"
  },
  {
    path: 'app/(tabs)/bookings.tsx',
    search: "navigation.navigate(/(tabs),",
    replace: "navigation.navigate('Main',"
  },
  {
    path: 'app/signup.tsx',
    search: "navigation.navigate(/login)",
    replace: "navigation.navigate('Login')"
  }
];

filesToFix.forEach(item => {
    const fullPath = path.join(process.cwd(), item.path);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(item.search)) {
            content = content.replace(item.search, item.replace);
            fs.writeFileSync(fullPath, content);
            console.log(`Fixed ${item.path}`);
        } else {
            console.log(`Pattern not found in ${item.path}`);
        }
    } else {
        console.log(`File not found: ${item.path}`);
    }
});
