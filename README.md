# Prestige Optics — eyeglasses try-on

Angular storefront demo with MediaPipe iris-based virtual try-on.

## Live preview (stable URL)

https://angular-ffxezk-ablmogh9.stackblitz.io

Editor: https://stackblitz.com/edit/angular-ffxezk-ablmogh9

That StackBlitz project id (`angular-ffxezk-ablmogh9`) is what fixes the preview URL. GitHub alone cannot recreate that slug — connect the repo to **that** project once (steps below).

## One-time: link this GitHub repo to that StackBlitz project

1. Open https://stackblitz.com/edit/angular-ffxezk-ablmogh9 (signed in as **ynachar**).
2. Click **Connect repository** (top left / project menu).
3. Choose **import an existing repository**.
4. Paste: `https://github.com/ynachar/angular-ffxezk`
5. Pull / sync so the editor matches GitHub.

After that, `git push` here updates StackBlitz when you pull/sync (or auto-sync if enabled), and the site URL stays:

https://angular-ffxezk-ablmogh9.stackblitz.io

## Cursor → GitHub

```bash
cd ~/DEV-Github/prestige-optics-tryon
git add -A && git commit -m "your message" && git push origin main
```

## Local

```bash
npm install
npm start
```
