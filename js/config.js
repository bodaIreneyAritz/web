/*
  Deixa les URLs senceres FORA del repo.
  Convidats (curt): ?f=<suffix-form>&a=<codi-photos>
  El prefix 1FAIpQLSf del Forms s’afegeix sol. També accepta ?form= / ?album=
  i URLs https completes.

  linkHints: 3–4 caràcters únics de cada ID. Sense el hint → no es mostren
  els botons. No posis mai la URL sencera aquí.
*/
window.WEDDING_CONFIG = {
  googleFormUrl: "",
  photosAlbumUrl: "",
  linkHints: {
    form: "k2Kb", // tros de l’ID del Google Form
    album: "Bj1Z", // tros de l’ID de Google Photos
  },
  maps: {
    ceremony: "https://maps.app.goo.gl/NcePm9ZBdFpXrGbw9",
    celebration: "https://maps.app.goo.gl/JhsA1ZMcNszp3PSj9",
    bilbaoBus: "https://online.pesa.net/",
    sanSebastianAirport:
      "https://maps.app.goo.gl/fFY54bsoofeJXkt57",
    hotelAlameda: "https://www.hotelalameda.net/es/zarautz/",
    hostalTxikiPolit: "https://txikipolit.eus/es/",
  },
  phones: {
    hotelAlameda: "+34943132737",
    hostalTxikiPolit: "+34943835357",
  },
};
