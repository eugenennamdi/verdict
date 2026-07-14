/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const outDir = path.join(__dirname, '..', 'public', 'brand-assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const vMark = `<g transform="translate(15, 16) scale(2)"><path d="M4 5L12 19L20 5" stroke="#f97316" stroke-width="4.5" stroke-miterlimit="10" stroke-linecap="butt" stroke-linejoin="miter" /></g>`;
const vMarkCenter = `<g transform="translate(26, 26) scale(2)"><path d="M4 5L12 19L20 5" stroke="#f97316" stroke-width="4.5" stroke-miterlimit="10" stroke-linecap="butt" stroke-linejoin="miter" /></g>`;

const assets = {
  'verdictlogoWM_light.svg': `<svg width="1200" height="320" viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg">${vMark}<text x="80" y="52" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#0f172a" letter-spacing="-0.03em">VERDICT</text></svg>`,
  'verdictlogoWM_dark.svg': `<svg width="1200" height="320" viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg">${vMark}<text x="80" y="52" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#ffffff" letter-spacing="-0.03em">VERDICT</text></svg>`,
  'verdictlogo_light.svg': `<svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#ffffff" />${vMarkCenter}</svg>`,
  'verdictlogo_dark.svg': `<svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="#0f172a" />${vMarkCenter}</svg>`,
};

for (const [filename, content] of Object.entries(assets)) {
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, content);
  
  const pngFilename = filename.replace('.svg', '.png');
  const pngPath = path.join(outDir, pngFilename);
  
  const resvg = new Resvg(content, {
    font: {
      loadSystemFonts: false, // We don't really have system-ui inside resvg reliably, but standard sans-serif might work. Let's see.
    },
    fitTo: {
      mode: 'width',
      value: filename.includes('WM') ? 1200 : 400
    },
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`Generated ${filename} and ${pngFilename}`);
}
