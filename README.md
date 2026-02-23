# Barcode Generator - Simplified Version

This version uses **client-side barcode generation** to avoid issues with the `canvas` package on Windows.

## How It Works

- **Frontend**: Generates barcodes directly in the browser using `jsbarcode`
- **Backend**: Optional - can be used for future features like saving barcodes, user management, etc.

## Quick Start

### Option 1: Frontend Only (No Backend Needed)

```bash
cd client
npm install
npm run dev
```

The app will run on `http://localhost:5173` and work immediately!

### Option 2: With Backend (For Future Features)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

## Benefits of Client-Side Generation

✅ No complex canvas package installation
✅ Works on all platforms (Windows, Mac, Linux)
✅ Faster - no server round trip
✅ Works offline
✅ No server dependencies issues

## Features

- Generate barcodes in CODE128, CODE39, EAN13, UPC-A, and ITF formats
- Customize width, height, and display options
- Download as PNG
- Beautiful glassmorphism UI with TailwindCSS
