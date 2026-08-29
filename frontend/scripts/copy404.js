const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '..', 'dist');
const index = path.join(dist, 'index.html');
const dest = path.join(dist, '404.html');

if (!fs.existsSync(index)) {
  console.error('index.html not found in dist. Did you run `npm run build`?');
  process.exit(1);
}

fs.copyFile(index, dest, (err) => {
  if (err) {
    console.error('Failed to copy index.html to 404.html', err);
    process.exit(1);
  }
  console.log('Created dist/404.html (SPA fallback for static hosts)');
});