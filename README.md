# Seismic Explorer - Windows XP Style Ecosystem Browser

A nostalgic Windows XP-themed interface for browsing the Seismic ecosystem of projects.

## Features

- **Windows XP Aesthetic**: Classic Bliss background, authentic UI elements
- **Draggable Icons**: Move project icons around the desktop freely
- **Multiple Windows**: Open multiple project websites simultaneously
- **Taskbar Integration**: All open windows appear in the taskbar
- **Recycle Bin**: Delete icons to the bin and restore them later
- **Start Menu**: Access programs, documents, and settings
- **Sound Effects**: Optional Windows XP-style sound effects
- **Local Storage**: Desktop layout and deleted items persist across sessions
- **Responsive Loading**: Windows XP-style loading screens with progress bars

## Setup Instructions

### 1. Create Folder Structure

```
seismic-explorer/
├── index.html
├── app.js
├── style.css
├── config.json
├── README.md
└── assets/
    ├── logos/
    │   ├── Avvio.jpg
    │   ├── Blend.jpg
    │   ├── Brookwell.jpg
    │   ├── Cred_Protocol.jpg
    │   ├── DashX.jpg
    │   ├── Pagga.jpg
    │   ├── Port_Markets.jpg
    │   ├── Prism.jpg
    │   ├── Promis.jpg
    │   ├── Reah.jpg
    │   ├── Sedona.jpg
    │   ├── Shift.jpg
    │   ├── Specie.jpg
    │   ├── Vend.jpg
    │   └── VIA.jpg
    └── seismic-logo.png
```

### 2. Add Logo Files

Place all the project logos you have in `assets/logos/` folder.
Place the Seismic logo in `assets/` folder.

### 3. Update Config (Optional)

If you want to modify projects, edit `config.json`:

```json
{
  "projects": [
    {
      "id": "avvio",
      "name": "Avvio",
      "url": "https://avvio.xyz/",
      "logo": "assets/logos/Avvio.jpg",
      "twitter": "https://x.com/tryavvio"
    }
    // ... more projects
  ],
  "seismic": {
    "logo": "assets/seismic-logo.png",
    "docs": "https://docs.seismic.systems/",
    "discord": "https://discord.com/invite/seismic",
    "twitter": "https://x.com/SeismicSys"
  }
}
```

### 4. Deploy to GitHub Pages

1. Create a new GitHub repository named `seismic-explorer`
2. Push all files to the `main` branch
3. Go to Settings → Pages → Select `main` as source
4. Your site will be live at `https://yourusername.github.io/seismic-explorer/`

## How to Use

### Desktop Interaction
- **Double-click** icon: Open project website
- **Drag** icon: Move icon around desktop
- **Right-click** icon: Delete to recycle bin
- **Click & hold on title bar**: Drag window around

### Taskbar
- Click taskbar button: Minimize/restore window
- Close button (X): Close window completely

### Start Menu
- **Programs**: Quick access to all projects
- **Documents**: About Seismic
- **Settings**: Toggle sound on/off
- **Help**: Links to docs, Discord, Twitter
- **Shut Down**: Exit

### Recycle Bin
- Double-click or right-click icons to delete
- Open Recycle Bin to restore items
- Empty Bin to permanently delete

## Customization

### Change Background
The Bliss gradient is hardcoded in `style.css`. To change it, modify the `background` property in the `body` selector.

### Change Icon Size
Modify `.desktop-icon` width/height and `.icon-image` dimensions.

### Add New Projects
1. Add project entry to `config.json`
2. Add logo file to `assets/logos/`
3. Reload the page

## Technical Details

- **Framework**: React 18 (via CDN)
- **Storage**: localStorage for desktop state
- **Sandbox**: iframes use sandbox attribute for security
- **Responsive**: Adapts to window size
- **No Dependencies**: Runs entirely in browser

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires modern JavaScript support

## Credits

Seismic Explorer - A nostalgic tribute to Windows XP

## License

MIT - Use freely!
