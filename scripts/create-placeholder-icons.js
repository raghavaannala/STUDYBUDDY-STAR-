const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple base64 PNG icon (1x1 pixel placeholder)
const createPlaceholderPNG = (size) => {
  // This is a minimal 1x1 transparent PNG in base64
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

// Generate placeholder icons
sizes.forEach(size => {
  const pngData = createPlaceholderPNG(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, pngData);
  console.log(`✅ Generated ${filename}`);
});

console.log('\n🎉 Placeholder icons created successfully!');
console.log('📝 These are minimal placeholder PNGs to stop the console errors.');
console.log('🎨 For production, replace these with proper icons using:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://favicon.io/');
console.log('   - Or any image editor to create proper 144x144, 192x192, etc. icons');

// Also create a simple service worker registration script
const swContent = `
// Simple service worker for PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handling
});
`;

const swPath = path.join(__dirname, '../public/sw.js');
fs.writeFileSync(swPath, swContent.trim());
console.log('✅ Generated basic service worker: sw.js');
