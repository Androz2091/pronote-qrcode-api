const fetch = require('node-fetch');

const decipher = require('./decipher');
const decodeQR = require('./decode-qr');
const cookies = require('./cookies');
const createUUID = require('./uuid');

// Constante. Ne doit pas être changée tant que Pronote ne s'amuse pas à le faire.
const URLMobileSiteInfo = `infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4`;

const getBaseURL = (pronoteURL) => pronoteURL.substr(0, pronoteURL.length - '/mobile.eleve.html'.length);

const fetchInfoMobileApp = async (qrCodeData) => {
    const res = await fetch(`${getBaseURL(qrCodeData.url)}/${URLMobileSiteInfo}`);
    const data = await res.json();
    return data;
}

const filePath = process.argv[process.argv.indexOf('--input')+1];
const tokenCode = process.argv[process.argv.indexOf('--code')+1];
const qrCodeData = decodeQR(filePath);
fetchInfoMobileApp(qrCodeData).then((result) => {
    console.log(qrCodeData);
    console.log(result);
    const login = decipher.decipherLogin(qrCodeData.login, decipher.getBuffer(tokenCode), decipher.getBuffer(''));
    const token = decipher.decipherLogin(qrCodeData.jeton, decipher.getBuffer(tokenCode), decipher.getBuffer(''));
    console.log(login);
    console.log(token);

    const generatedUUID = createUUID();
    const cookie = generateCookie(generatedUUID);
    console.log(cookie);

    //fetch('https://0310047h.index-education.net/pronote/appelfonction/6/6513781/2251c83c89cf957d23445ec8e23f2e1b')
})
