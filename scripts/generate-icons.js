const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG icon template
const generateSVGIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#f59e0b">
  <rect width="24" height="24" rx="4" fill="#1A1F2B"/>
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
  <text x="12" y="20" text-anchor="middle" fill="#f59e0b" font-family="Arial, sans-serif" font-size="3" font-weight="bold">SB★</text>
</svg>
`.trim();

// Generate placeholder icons
sizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

console.log('✅ Icon generation complete!');
console.log('📝 Note: These are placeholder SVG icons. For production, convert them to PNG using an online tool or image editor.');
console.log('🔗 Recommended: Use https://realfavicongenerator.net/ for professional icon generation.');
