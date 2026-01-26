# Promise Engine Frontend

React frontend for Promise Engine.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Runs on http://localhost:3000

API requests proxy to http://localhost:5000 (backend must be running)

## Development

```bash
# Start dev server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page-level components
├── styles/         # CSS and theme files
├── utils/          # Utility functions
├── App.js          # Main application
└── index.js        # React entry point
```

## Visual Theme

Promise Engine uses a sky/cloud aesthetic with:
- Sky blue gradients
- Floating cloud animations
- Scanline overlay (VHS/CRT effect)
- Clean, minimal typography
