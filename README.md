# craig-wen-portfolio

Static portfolio site. No build step — plain HTML, one stylesheet, one script.

Live at <https://craigwen.github.io/craig-wen-portfolio/>, deployed by GitHub
Pages from `main` on every push.

## Local preview

```sh
python3 -m http.server 8765
```

Then open <http://localhost:8765>.

## Asset cache busting

`style.css` and `app.js` are referenced with a content hash — `style.css?v=004c1cc5`
— so a changed file always gets a new URL and browsers can never pair new HTML
with a stale stylesheet.

A `pre-commit` hook keeps those stamps current. **It needs one-time setup after
cloning**, because git config doesn't travel with a clone:

```sh
git config core.hooksPath .githooks
```

Without that, commits still succeed but the stamps go stale, which is exactly the
bug the hook exists to prevent. To check it's active:

```sh
git config core.hooksPath   # should print .githooks
```

You can also run the stamper by hand at any time; it's idempotent:

```sh
python3 scripts/stamp-assets.py
```
