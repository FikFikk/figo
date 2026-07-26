import fs from 'fs';
import sharp from 'sharp';

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#0058be"/>
  <text x="50%" y="50%" font-family="sans-serif" font-weight="bold" font-size="200" fill="white" text-anchor="middle" dominant-baseline="central">FiGo</text>
</svg>`;

async function createIcons() {
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile('./public/pwa-192x192.png');
    
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile('./public/pwa-512x512.png');
    
  // Download icon
  const downloadSvg = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><rect width="192" height="192" rx="40" fill="#2d3133"/><text x="50%" y="50%" font-family="sans-serif" font-size="80" fill="white" text-anchor="middle" dominant-baseline="central">DL</text></svg>`;
  await sharp(Buffer.from(downloadSvg)).png().toFile('./public/icon-download.png');
  
  // Artikel icon
  const artikelSvg = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><rect width="192" height="192" rx="40" fill="#bd3140"/><text x="50%" y="50%" font-family="sans-serif" font-size="80" fill="white" text-anchor="middle" dominant-baseline="central">A</text></svg>`;
  await sharp(Buffer.from(artikelSvg)).png().toFile('./public/icon-artikel.png');
  
  // Convert icon
  const convertSvg = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><rect width="192" height="192" rx="40" fill="#358b5e"/><text x="50%" y="50%" font-family="sans-serif" font-size="80" fill="white" text-anchor="middle" dominant-baseline="central">Cvt</text></svg>`;
  await sharp(Buffer.from(convertSvg)).png().toFile('./public/icon-convert.png');
  
  // Compress icon
  const compressSvg = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><rect width="192" height="192" rx="40" fill="#c49a37"/><text x="50%" y="50%" font-family="sans-serif" font-size="80" fill="white" text-anchor="middle" dominant-baseline="central">Cmp</text></svg>`;
  await sharp(Buffer.from(compressSvg)).png().toFile('./public/icon-compress.png');

  console.log('Icons generated successfully.');
}

createIcons().catch(console.error);
