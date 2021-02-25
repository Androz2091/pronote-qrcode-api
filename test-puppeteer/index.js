const puppeteer = require('puppeteer');

(async () => {

    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto('https://0840853w.index-education.net/pronote/mobile.eleve.html');

    page.evaluate(() => {

        // a récupérer dans la console

    });

})();

/*

(async () => {

    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto('https://0310047h.index-education.net/pronote/infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4');

    await page.evaluate(() => {
        (function(){
            try {
                var lJetonCas = "",
                    lJson = JSON.parse(document.body.innerText);
                    lJetonCas = !!lJson && !!lJson.CAS && lJson.CAS.jetonCAS;
                
                document.cookie = "appliMobile=;expires=" + new Date(0).toUTCString();
                if(!!lJetonCas) {
                    document.cookie = "validationAppliMobile="+lJetonCas+";expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();
                    document.cookie = "uuidAppliMobile=5bf3d293-624a-5a8c-5a15-6a2f4eacc937;expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();
                    document.cookie = "ielang=fr;expires=" + new Date(new Date().getTime() + (365*24*60*60*1000)).toUTCString();
                    return "ok";
                } else return "ko";
            } catch(e){
                return "ko";
            }
        })();
    });

    const cookies = await page.cookies();
    console.log(cookies);

    await page.evaluate(() => {
        location.assign("https://0310047h.index-education.net/pronote/mobile.eleve.html?fd=1");
    })

})();

*/