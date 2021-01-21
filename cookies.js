// D'après ce que j'ai compris, cette fonction permettrait de définir des cookies à injecter
// dans la page infoMobileApp.json qui pourrait potentiellement... bypass le CAS ?

// En gros, si le cookie est défini, l'utilisateur ne serait pas redirigé vers le CAS
// mais juste vers une page de connexion où on pourrait rentrer le login et le jeton récupérés grâce au QR Code. A tester.

module.exports.generateCookie = (generatedUUID) => {
    return `
        (function(){
            try {
                var lJetonCas = "",
                    lJson = JSON.parse(document.body.innerText);
                    lJetonCas = !!lJson && !!lJson.CAS && lJson.CAS.jetonCAS;
                
                document.cookie = "appliMobile=;expires=" + new Date(0).toUTCString();
                if(!!lJetonCas) {
                    document.cookie = "validationAppliMobile="+lJetonCas+";expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();
                    document.cookie = "uuidAppliMobile=${generatedUUID};expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();
                    document.cookie = "ielang=${'fr'};expires=" + new Date(new Date().getTime() + (365*24*60*60*1000)).toUTCString();
                    return "ok";
                } else return "ko";
            } catch(e){
                return "ko";
            }
    })();
    `
};

module.exports.getLocationAssignment = (serverURL) => {
    return `
        location.assign("${serverURL}/mobile.eleve.html?fd=1");
    `;
};
