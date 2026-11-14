# Irene & Aritz — web del casament

Web estàtica (sense backend) amb informació del casament i enllaços a Google Forms / àlbum de fotos.

## Idiomes

Euskera, català i castellà. Es detecta l’idioma del navegador (`eu` / `ca` / `es`) i es pot canviar amb el selector. La preferència es desa a `localStorage`.

## Veure en local

```bash
python3 -m http.server 8080
```

Obre [http://localhost:8080](http://localhost:8080).

## Formulari i àlbum (sense exposar-los als bots)

1. A `js/config.js` → `linkHints`, posa **3–4 caràcters únics** de cada ID (Forms / Drive), **no** la URL sencera.
2. Comparteix als convidats només amb l’ID:

```
https://USER.github.io/REPO/?f=k2KbJm90...&a=Bj1Z69oPZTvbtikQ6
```

`f` = ID de Forms **sense** el prefix `1FAIpQLSf` (s’afegeix sol); `a` = codi de `photos.app.goo.gl/...`. La web reconstrueix les URLs i només mostra els botons si l’ID conté el hint.

## Entorn de desenvolupament (Docker a la LAN)

```bash
./deploy-dev.sh
```

Puja el projecte a `root@10.10.100.104:/opt/aritz-irene` i aixeca nginx a **http://10.10.100.104:8080/**.

Variables opcionals: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_DIR`, `DEPLOY_PORT`.

## Desplegar a GitHub Pages (més endavant)

Puja el repositori i activa Pages des de la branca `main` (carpeta arrel `/`).
