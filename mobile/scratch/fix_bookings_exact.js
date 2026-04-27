const fs = require('fs');
const path = require('path');

const p = path.join(process.cwd(), 'app', '(tabs)', 'bookings.tsx');
let c = fs.readFileSync(p, 'utf8');

const target = "{t(`status.${status.toLowerCase()} as any)}";
const replacement = "{t(`status.${status.toLowerCase()}`)}";

if (c.indexOf(target) !== -1) {
    c = c.split(target).join(replacement);
    fs.writeFileSync(p, c);
    console.log("Fixed bookings.tsx");
} else {
    console.log("Target not found. Current line 94 is:");
    const lines = c.split('\n');
    console.log(lines[93]); // 0-indexed, so 93 is line 94
}
