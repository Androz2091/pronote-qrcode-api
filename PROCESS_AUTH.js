// 1ère étape : un profil "vide" est créé.

// InterfaceProfil ligne 79

this.profilCourant = {
    serverUrl: '',
    espaceUrl: '',
    nomEtab: '', // complété infoMobileApp (nomEtab)
    nomEsp: '', //
    login: '', // complété avec qr code
    mdp: '',
    libelle: '',
    bypassCAS: false,
    estCAS: false, // complété infoMobileApp (CAS.actif)
    casURL: '', // complété infoMobileApp (CAS.casURL)
    modeJeton: false,
    essai: 0,

    jeton: '' // complété avec qr code
};

aUrl = {
    protocol: lParser.protocol,
    hostname: lParser.hostname,
    port: lParser.port,
    pathname: lParser.pathname,
    host: lParser.host,
    href: lParser.href,
    espace: lEspace, // récupéré avec l'URL du qrcode (ils font un split sur l'URL pour récupérer le nom de l'espace)
    bypassCas: lBypassCas // vrai si login=true est inclu dans l'URL
}