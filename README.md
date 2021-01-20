# Pronote QR Code API

## Fonctionnement

* QRCode scanné. Ce QRCode renvoie un JSON contenant plusieurs informations:
```js
{
  jeton: 'JETON_SUPER_LONG',
  login: 'JETON_MOYEN_LONG',
  url: 'https://0310047h.index-education.net/pronote/mobile.eleve.html'
}
```

* A partir de l'URL Pronote trouvée ci-dessus, on peut effectuer un appel vers cette URL:
```js
// https://0310047h.index-education.net/pronote/infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4

{
  modeModif: true,
  version: [ 2020, 0, 2, 5 ],
  date: '2021-01-20T11:48:47.694Z',
  CAS: {
    actif: true,
    casURL: 'https://cas.mon-ent-occitanie.fr',
    jetonCAS: 'JETON_SUPER_LONG_QUI_CHANGE_A_CHAQUE_RAFRAICHISSEMENT'
  },
  espaces: [
    { nom: 'Espace Direction', URL: 'mobile.direction.html' },
    { nom: 'Espace Professeurs', URL: 'mobile.professeur.html' },
    { nom: 'Espace Vie scolaire', URL: 'mobile.viescolaire.html' },
    { nom: 'Espace Parents', URL: 'mobile.parent.html' },
    { nom: 'Espace Accompagnants', URL: 'mobile.accompagnant.html' },
    { nom: 'Espace Élèves', URL: 'mobile.eleve.html' }
  ],
  nomEtab: 'LYCEE OZENNE'
}
```
A noter : le paramètre ID (`0D264427-EEFC-4810-A9E9-346942A862A4`) est une constante et ne varie pas d'un établissement à l'autre.

* Pronote demande le code d'accès rentré précédemment.