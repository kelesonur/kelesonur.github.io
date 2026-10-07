# Poze demo site

Product introduction and demo for Poze (text to sign language). Static site for GitHub Pages at
`https://kelesonur.github.io/poze/`.

## What is here

- `index.html`: the landing page and demo (one file, no build step).
- `assets/examples.json`: the curated sentences (Turkish, gloss, and how each sign was found).
- `player/index.html`: the latest avatar renderer (copy of `rendering_attempts/gemma4_all25/page_hinge`,
  elbow-twist fix, Business_Male_06, navy shirt) with an added `?embed=1` mode. In embed mode it hides its
  own controls and talks to the landing page through `postMessage` (play, pause, restart, speed, view,
  face, seek to a sign; it reports the current frame and sign back).
- `player/motions/<id>.json`: motion files from `mac_render/motions_avatar` (Gemma 4 run, 5 Oct).
- `player/avatar-rocketbox-business-male.wasm`: the avatar model (glb under a .wasm name).

`player/motions/1663-01.json` is not used and can be deleted.

## Publish on GitHub Pages

1. Create a public repository named `poze` under `kelesonur`.
2. Put the contents of this folder at the root of the repository and push to `main`.
3. Settings > Pages > Build and deployment: Deploy from a branch, `main`, `/ (root)`.
4. The site appears at `https://kelesonur.github.io/poze/` after a minute or two.

## Live mode

The "Try your own sentence" section calls the free-translation server
(`signer_study/free_translation/run_server.sh`, default `http://127.0.0.1:8765`). The server already
allows requests from `https://kelesonur.github.io`. Endpoints used: `GET /health`, `GET /progress`,
`POST /translate` with `{"sentence", "figure": "avatar"}` and an optional `x-api-key` header.
Add `?api=https://your-server` to the page URL to point it at another server. Safari blocks calls from
an https page to a local http server; use Chrome or Edge for the local setup.

## Add an example

1. Copy the motion file to `player/motions/<id>.json`.
2. Add an entry to `assets/examples.json`: `id`, `turkish`, `gloss`, `seconds`
   (playback frames / 24) and `signs` (one per sign segment in the motion `label` track, in order,
   with `label`, `strategy` and `source` from the sample's `tokens.json`).
3. Add an English translation and a short description to the `EN` and `SHOWS` maps in `index.html`.

## Test locally

    cd poze_site && python3 -m http.server 8000
    open http://localhost:8000/
