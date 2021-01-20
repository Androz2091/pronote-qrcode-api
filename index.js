const fetch = require('node-fetch');

const decodeQR = require('./decode-qr');

// Constante. Ne doit pas être changée tant que Pronote ne s'amuse pas à le faire.
const URLMobileSiteInfo = `infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4`;

const getBaseURL = (pronoteURL) => pronoteURL.substr(0, pronoteURL.length - '/mobile.eleve.html'.length);

const fetchInfoMobileApp = async (qrCodeData) => {
    const res = await fetch(`${getBaseURL(qrCodeData.url)}/${URLMobileSiteInfo}`);
    const data = await res.json();
    console.log(data);
}

const qrCodeData = decodeQR(process.argv[process.argv.indexOf('--input')+1]);
fetchInfoMobileApp(qrCodeData).then((result) => {
    console.log(qrCodeData);
    console.log(result);
})
