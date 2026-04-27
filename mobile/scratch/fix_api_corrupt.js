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

      // Fix corrupted Bookings string in API calls
      // Match: /api'Book'ings -> /api/bookings
      if (content.includes("'Book'ings")) {
          content = content.replace(/'Book'ings/g, '/bookings');
          // Handle cases where it was /api/user'Book'ings
          content = content.replace(/\/bookings/g, '/bookings'); // Ensure consistency
          changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed API calls in ${filePath}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
