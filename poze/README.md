# SignPoze demo site

Product introduction and demo for SignPoze (text to sign language). Static site for GitHub Pages at
`https://kelesonur.github.io/poze/`.

## What is here

- `index.html`: the landing page and demo (one file, no build step).
- `tr/index.html`: the Turkish page. The live translation form comes first and drives the same signer as
  the examples (one player; your result is added to the example rail). It has a large pause button on the
  signer and the Space key pauses and resumes. It reads `../assets/examples.json` and `../player/`.
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
3. Add an English translation and a short description to the `EN` and `SHOWS` maps in `index.html`,
   and a Turkish description to the `SHOWS` map in `tr/index.html`.

## Test locally

    cd poze_site && python3 -m http.server 8000
    open http://localhost:8000/

## Changes 9 Oct 2026

- Normal playback is now 75% of recorded speed (half speed button unchanged).
- Two-handed dictionary signs whose recorded hands touch (for example İSİM) now pull the avatar's hands
  together (`signTouch` in `player/index.html`); before, only fingerspelled letters did.
  Known leftover: a few frames in 1330-01 and 492-03 still overlap by about 1 cm.
- Hand cleanup when a motion loads (`HAND_CLEAN` in `player/index.html`): finger landmarks are smoothed over
  time (less shaking, for example NASIL), small finger bends under 30 degrees are made straight, and a
  pointing hand (index out, other fingers curled, for example SEN) gets a straight index and the other three
  fingers are set to a fist (they are hidden behind the hand in the video, so the tracker guesses). Fingerspelling is
  left as recorded. The left hand in NASIL still moves more than the right.
- Thumb of a pointing hand rests on the fist (photo of the real signer, 9 Oct).
- Eyebrows rise on question words (`QUESTION_WORD` in `player/index.html`: NE, NASIL, NEREDE, KİM, NEDEN, NİÇİN,
  KAÇ, HANGİ and forms), fading in 4 frames before the sign and out 5 frames after. Add words to that list.


## Agreement verbs (9 Oct 2026)
- Player puts the depth of an agreement verb back (wrist moves from start locus depth to end locus depth), because the exported wrist stays at arm's length. This is a compensation; the cause is upstream in the synthesis/export.
- Sideways eye gaze is no longer taken from the export (it was set during IX). The eyes turn toward the end locus only during an agreement verb (3a = left sign, 3b = opposite; 3b sign assumed).
