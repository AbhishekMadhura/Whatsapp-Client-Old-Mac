# WhatsApp Client for Old Macs

An unofficial desktop client for **WhatsApp** on older Macs running **macOS Catalina (10.15)**, built with Electron.

The official WhatsApp desktop app no longer supports older macOS versions, and using WhatsApp Web in a browser tab is slow to load every time. This project wraps WhatsApp Web (`web.whatsapp.com`) in its own app window, using an Electron version that still runs on Catalina.

> **Disclaimer:** This is an independent project. It is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta. "WhatsApp" is a trademark of WhatsApp LLC. The app only loads the official WhatsApp Web page and does not modify, reimplement, or reverse-engineer WhatsApp.

## Features

- Dedicated WhatsApp window instead of a browser tab
- Stays signed in between launches
- Desktop notifications
- Unread count shown on the Dock icon
- Closing the window hides it; click the Dock icon to bring it back, or press Cmd+Q to quit
- Links open in your default browser

## Why Electron 32?

| Option | Result on Catalina |
|---|---|
| Tauri | Uses the system WebKit (Safari 15.6.1 on Catalina). WhatsApp Web loaded half-styled and failed to link a device |
| Electron 32 | Ships its own Chromium 128, the last Chromium version that supports Catalina |

Electron 33 and later require macOS 11 or newer, so this project is pinned to **Electron 32**. Do not upgrade it on Catalina.

## Requirements

- macOS 10.15 Catalina (Intel, x64)
- Node.js 20 or an older LTS (newer Node versions may not run on Catalina)
- npm
- WhatsApp installed on your phone, to link the device

## Getting started

```bash
git clone https://github.com/AbhishekMadhura/Whatsapp-Client-Old-Mac.git
cd Whatsapp-Client-Old-Mac
npm install
npm start
```

When the window opens, scan the QR code with your phone: **WhatsApp > Settings > Linked devices > Link a device**.

## Build the app

```bash
npx electron-packager . WhatsApp --platform=darwin --arch=x64 --overwrite
```

This creates a `WhatsApp-darwin-x64` folder containing `WhatsApp.app`. Drag it into your Applications folder.

Because the app is unsigned, macOS may block it the first time. Right-click `WhatsApp.app`, choose **Open**, then confirm.

## Project structure

```
.
├── main.js         # Electron main process (window, user agent, badge, tray behavior)
├── package.json
└── README.md
```

## How it works

The app opens a normal Electron window pointed at `https://web.whatsapp.com`. It sets a Chrome user agent so WhatsApp Web accepts the browser, and stores the session in a persistent partition so you stay logged in. The Dock badge is read from the page title (for example `(3) WhatsApp`).

## Known limitations

- **It is a web wrapper, not a native client.** It has the same features and limits as WhatsApp Web, including limited calling.
- **Your phone must stay linked.** As with any WhatsApp Web session, WhatsApp may ask you to reconnect.
- **Aging browser engine.** Chromium 128 no longer receives security updates, and WhatsApp may eventually require a newer browser. If it shows an "update your browser" page, that is the likely cause.
- **Unsigned app.** It is not code-signed or notarized.
- **Default Electron icon.** Add your own `.icns` file and pass `--icon=icon.icns` to `electron-packager` to change it.

## Troubleshooting

**`npm start` fails with a JSON error.** Check `package.json` for a missing comma or stray character.

**Syntax error at the first line of `main.js`.** A stray character was probably pasted before `const`. Open the file and delete it.

**"WhatsApp works with Safari 15+" page.** The user agent is missing or wrong. Make sure `main.js` still sets it.

**Notifications do not appear.** Allow notifications for the app in System Preferences > Notifications.

**An old icon keeps showing after you rebuild.** Run `killall Dock` to clear the icon cache.

## Contributing

Issues and pull requests are welcome, especially from other people stuck on older macOS versions.
