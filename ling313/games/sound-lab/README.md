# Sound Lab (LING 313.02, Problem Set 2)

Open `index.html` in a browser. Keep the `clips/` folder next to it.

- `index.html`: the whole game (HTML, CSS and JavaScript in one file). Answer data is at the top of the script: `LISTEN`, `SPOT`, `TRANS`, `MATCH`, `ALLO`, `BOSS`.
- `clips/a-N.mp3`, `clips/b-N.mp3`: recordings 1-4 for Speaker A (Dora) and Speaker B (Seyfullah).
- `clips/*.png`: spectrograms shown in the Listening Lab.
- `tools/make_spectrograms.py`: script that made the PNGs (needs numpy, scipy, matplotlib, ffmpeg). Run it from the folder that contains `clips/`.

To change an answer, edit the `a` (model answer) and `alt` (also accepted) lists in the data at the top of the script.
