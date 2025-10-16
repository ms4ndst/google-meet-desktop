# Google Meet Desktop (Unofficial)

**Unofficial desktop application for Google Meet built with electron.**

![Screenshot of Google Meet Desktop](https://static.arjun-g.com/google-meet/google-meet-screenshot.jpg)

## Features

- Presenter can draw/annotate on screen when sharing the screen

  ![Demo of annotation feature](https://static.arjun-g.com/google-meet/google-meet-annotation.gif)

## Recent Updates (October 2025)

- Updated to Electron 27.0.0 for improved performance and security
- Modernized security settings and app configuration
- Added support for light/dark theme
- Updated all dependencies to their latest versions
- Improved Windows installer with proper application icons
- Enhanced browser compatibility for Google Meet

## Installation

### Windows Installer
You can find the installer in the `dist` folder after building:
- Run `Google Meet Setup 1.2.0.exe` to install
- The installer will automatically:
  - Create a desktop shortcut
  - Add a start menu entry
  - Set up proper icons
  - Configure uninstall options

### Manual Installation
You can also build it yourself (see below) or [download the latest release](https://github.com/arjun-g/google-meet-desktop/releases) for your operating system.

## Building

You'll need [Node.js](https://nodejs.org) installed on your computer in order to build this app.

```bash
$ git clone https://github.com/arjun-g/google-meet-desktop
$ cd google-meet-desktop
$ npm install
```

### Running the Development Version
```bash
$ npm start
```

### Creating an Installer
```bash
$ npm run dist
```

This will create the installer in the `dist` folder:
- Windows: `dist/Google Meet Setup 1.2.0.exe`
- macOS: `dist/Google Meet-1.2.0.dmg`
- Linux: `dist/google-meet-desktop_1.2.0_amd64.deb` and `dist/Google Meet-1.2.0.AppImage`
