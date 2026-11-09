# WhatsApp Desktop

A minimal, lightweight desktop client for WhatsApp Web, built with Electron.

No browser tabs, no address bar, no distractions. Just WhatsApp in its own window, with native
notifications, a dock badge for unread messages, and an app icon that belongs on your dock.

> **Unofficial.** This is an independent wrapper around `web.whatsapp.com`. It is not affiliated
> with, endorsed by, or supported by Meta or WhatsApp.

---

## Features

- **Dedicated window** — WhatsApp Web in its own app, not a browser tab
- **Unread badge** — the macOS dock icon shows your unread count
- **Native notifications** — message alerts come through the OS, not a browser
- **Persistent session** — you scan the QR code once; it stays logged in
- **Links open in your browser** — external links leave the app instead of trapping you inside it
- **Closes to background** — closing the window hides it, so it keeps receiving messages
- **Custom icon** — original artwork, no third-party trademarks

---

## Requirements

| Requirement | Version |
| --- | --- |
| [Node.js](https://nodejs.org/) | 18 or newer (tested on 22) |
| npm | 9 or newer (tested on 10) |
| An active WhatsApp account | linked to your phone |

Works on **macOS** and **Windows**. Linux is supported by Electron and the code is
platform-agnostic, but the packaging script below is written for macOS — see
[Building a distributable](#building-a-distributable).

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/whatsapp-electron.git
cd whatsapp-electron
```

### 2. Install dependencies

```bash
npm install
```

This pulls in Electron (~290 MB) and the packager. First install takes a minute or two.

### 3. Run it

```bash
npm start
```

The window opens on the WhatsApp Web login screen.

### 4. Link your account

Scan the QR code with your phone:

1. Open **WhatsApp** on your phone
2. Go to **Settings → Linked devices**
3. Tap **Link a device**
4. Point your phone at the QR code in the app window

You only do this once. The session is stored in a persistent partition and survives restarts.

---

## Usage notes

**Closing the window doesn't quit the app.** It hides to the background so messages keep
arriving. To actually quit:

- macOS: `Cmd + Q`, or right-click the dock icon → Quit
- Windows: right-click the taskbar icon → Close window

**Microphone and camera** are requested by WhatsApp itself when you start a voice or video call.
The app grants media permissions through Electron's permission handler.

**Where your session lives.** Login state is kept in Electron's per-app data directory, in a
partition named `persist:whatsapp`:

- macOS: `~/Library/Application Support/whatsapp-electron/Partitions/whatsapp`
- Windows: `%APPDATA%\whatsapp-electron\Partitions\whatsapp`

Delete that folder to log out completely.

---

## Building a distributable

The included `package` script builds a macOS Apple Silicon app:

```bash
npm run package
```

Output lands in `WhatsApp-darwin-arm64/`. For other targets, call the packager directly:

```bash
# macOS, Intel
npx electron-packager . WhatsApp --platform=darwin --arch=x64 --icon=assets/brand/logo.icns --overwrite

# Windows
npx electron-packager . WhatsApp --platform=win32 --arch=x64 --icon=assets/brand/logo.ico --overwrite

# Linux
npx electron-packager . WhatsApp --platform=linux --arch=x64 --overwrite
```

The build is unsigned. On macOS, Gatekeeper will warn on first launch — right-click the app and
choose **Open**, or clear the quarantine flag:

```bash
xattr -dr com.apple.quarantine "WhatsApp-darwin-arm64/WhatsApp.app"
```

---

## Project structure

```
whatsapp-electron/
├── main.js                      # the entire application (~66 lines)
├── package.json                 # scripts and dependencies
├── assets/
│   └── brand/
│       ├── logo.svg             # source of truth for the icon
│       ├── logo-1024.png        # runtime icon, transparent background
│       ├── logo.icns            # macOS bundle icon
│       ├── logo.ico             # Windows icon
│       └── render_logo.py       # regenerates the PNG from the SVG geometry
└── .gitignore
```

### Configuration

All app settings live in the `CONFIG` object at the top of `main.js`:

```js
const CONFIG = {
  title: 'WhatsApp',
  url: 'https://web.whatsapp.com',
  partition: 'persist:whatsapp',
  inApp: [],          // hosts allowed to open inside the app window
};
```

- **`url`** — change this to point the wrapper at a different web app
- **`partition`** — the session name; change it to keep a second, separate login
- **`inApp`** — domains that open inside the window instead of the system browser. Empty by
  default, so every link opens externally. Add entries like `'example.com'` to keep a domain in-app.

### Regenerating the icon

`logo.svg` is the source. The PNG is rendered by a small script rather than a generic SVG
converter, because most converters flatten transparency onto white:

```bash
python3 assets/brand/render_logo.py
```

Requires Pillow (`pip install Pillow`). After changing the PNG, rebuild the platform icons.

macOS `.icns` — `iconutil` needs the complete set including `@2x` variants:

```bash
mkdir -p logo.iconset
for s in 16 32 128 256 512; do
  sips -z $s $s assets/brand/logo-1024.png --out logo.iconset/icon_${s}x${s}.png
done
cp logo.iconset/icon_32x32.png   logo.iconset/icon_16x16@2x.png
cp logo.iconset/icon_256x256.png logo.iconset/icon_128x128@2x.png
cp logo.iconset/icon_512x512.png logo.iconset/icon_256x256@2x.png
sips -z 1024 1024 assets/brand/logo-1024.png --out logo.iconset/icon_512x512@2x.png
iconutil -c icns logo.iconset -o assets/brand/logo.icns
```

Windows `.ico` — needs a multi-size ICO. Pillow handles it in one line:

```bash
python3 -c "from PIL import Image; Image.open('assets/brand/logo-1024.png').save('assets/brand/logo.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])"
```

Note that `render_logo.py` reimplements the SVG geometry by hand. If you change shapes in the
SVG, mirror the change in the script; colors and layout are the parts most likely to stay fixed.

---

## Troubleshooting

**QR code won't load / blank window**
WhatsApp Web occasionally rejects unusual user agents. The app sets a Chrome 128 UA string in
`main.js`; if login breaks after a WhatsApp update, try updating that string.

**"This version of WhatsApp is out of date"**
WhatsApp Web requires a recent browser engine. Bump Electron:

```bash
npm install --save-dev electron@latest
```

**Notifications don't appear**
Check that notifications are allowed for the app in your OS settings. On macOS:
**System Settings → Notifications → WhatsApp**.

**Stuck on "Loading your chats"**
Clear the session and re-link. Quit the app, delete the partition folder listed under
[Usage notes](#usage-notes), and start again.

**App won't quit**
Closing the window only hides it. Use `Cmd + Q` on macOS or quit from the taskbar on Windows.

---

## Disclaimer

This project is an unofficial client. It is not affiliated with, endorsed by, or supported by
Meta Platforms, Inc. or WhatsApp. "WhatsApp" and the WhatsApp name are trademarks of Meta
Platforms, Inc. This project ships no WhatsApp branding or logo assets; the icon in
`assets/brand/` is original artwork.

Use it with your own account at your own risk. Automating or modifying the WhatsApp client may
be contrary to WhatsApp's Terms of Service, and accounts have been known to be restricted for
unofficial client use. Understand that before you use this.

## License

ISC — see [LICENSE](LICENSE).
