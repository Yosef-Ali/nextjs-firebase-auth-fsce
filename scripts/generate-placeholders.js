const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure the images directory exists
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Color palettes for each category
const categoryColors = {
  'child-protection': [
    { bg: '#FFE5B4', text: '#FF6B6B', title: 'Child Protection' },
    { bg: '#FFD700', text: '#FF4500', title: 'Child Safety' },
    { bg: '#FFA07A', text: '#8B0000', title: 'Protection' },
    { bg: '#FFB6C1', text: '#8B008B', title: 'Child Care' }
  ],
  'youth-empowerment': [
    { bg: '#E6E6FA', text: '#4169E1', title: 'Youth Empowerment' },
    { bg: '#98FB98', text: '#006400', title: 'Youth Leadership' },
    { bg: '#87CEFA', text: '#00008B', title: 'Empowerment' },
    { bg: '#DDA0DD', text: '#800080', title: 'Youth Development' }
  ],
  'advocacy': [
    { bg: '#F0E68C', text: '#8B4513', title: 'Child Advocacy' },
    { bg: '#E0FFFF', text: '#008B8B', title: 'Rights Advocacy' },
    { bg: '#F4A460', text: '#A0522D', title: 'Advocacy' },
    { bg: '#D8BFD8', text: '#800080', title: 'Voice of Children' }
  ],
  'humanitarian-response': [
    { bg: '#FFB6C1', text: '#8B0000', title: 'Humanitarian Aid' },
    { bg: '#F0E68C', text: '#B8860B', title: 'Emergency Response' },
    { bg: '#E6E6FA', text: '#4B0082', title: 'Crisis Support' },
    { bg: '#F4A460', text: '#A0522D', title: 'Humanitarian Care' }
  ]
};

async function createPlaceholderImage(category, index, { bg, text, title }) {
  const width = 800;
  const height = 600;
  const filename = `${category}-${index + 1}.jpg`;
  const filepath = path.join(imagesDir, filename);

  // Create SVG with text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bg}"/>
      <text 
        x="50%" 
        y="40%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="50" 
        font-weight="bold" 
        fill="${text}">
        ${title}
      </text>
      <text 
        x="50%" 
        y="60%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="30" 
        fill="${text}">
        Program ${index + 1}
      </text>
    </svg>
  `;

  // Generate image
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(filepath);

  return filename;
}

async function generatePlaceholders() {
  const placeholderMap = {};

  for (const [category, colors] of Object.entries(categoryColors)) {
    placeholderMap[category] = await Promise.all(
      colors.map((colorScheme, index) => 
        createPlaceholderImage(category, index, colorScheme)
      )
    );
  }

  console.log('Placeholder images generated:', placeholderMap);
  return placeholderMap;
}

generatePlaceholders();
