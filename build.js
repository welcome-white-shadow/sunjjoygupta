// Simple static-site build: packs all deployable assets into dist/
const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');

// Clean previous build
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Static assets to publish
const assets = [
  'index.html',
  'course-boosting.html',
  'course-management.html',
  'course-supervisory.html',
  'course-industrial-excellence.html',
  'course-freshers.html',
  'script.js',
  'styles.css',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest',
  'llms.txt',
  'profile.jpg',
  'book-cover.png',
  'book-bridge.jpg',
  'team-suryamani.png',
  'team-yogesh.png',
  'cert-1.png',
  'cert-2.png',
  'cert-3.png',
  'cert-4.png',
  'cert-5.png',
  'cert-6.png',
];

let copied = 0;
for (const file of assets) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, file));
    console.log('  + ' + file);
    copied++;
  } else {
    console.log('  - ' + file + ' (missing, skipped)');
  }
}

console.log('\nBuild complete: ' + copied + ' files -> dist/');
