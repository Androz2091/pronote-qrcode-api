const { PNG } = require('pngjs');
const jsQR = require('jsqr');
const fs = require('fs');

module.exports = (filePath) => {
    const imageBase64 = fs.readFileSync(filePath, {
        encoding: 'base64'
    });
    const png = PNG.sync.read(Buffer.from(imageBase64, 'base64'));
    const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
    
    return JSON.parse(code.data);
};
