# Piano Trainer

A web app for practicing piano note reading with a MIDI keyboard.

## Features

- **WebMIDI Integration**: Direct access to connected MIDI keyboards
- **Professional Music Notation**: Uses [VexFlow](https://github.com/0xfe/vexflow) for authentic sheet music rendering
- **Grand Staff**: Treble and bass clefs displayed simultaneously
- **Real-time Feedback**: Played notes are visually highlighted
- **Progress Tracking**: Statistics on correct and incorrect answers
- **Adaptive Difficulty**: Frequently missed notes appear more often
- **Audio Feedback**: Optional tone playback when pressing keys
- **Accidentals**: Supports sharps (#) and flats (♭)
- **Extended Range**: 6 octaves from C1 to C7 (MIDI 24-96)
- **Responsive Design**: Works on desktop, tablet, and smartphone

## Tech Stack

- [Vue 3](https://github.com/vuejs/core) with Composition API
- [VexFlow](https://github.com/0xfe/vexflow) for music notation
- [WebMIDI API](https://webaudio.github.io/web-midi-api/) for piano input
- [VueUse](https://github.com/vueuse/vueuse) for composables
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Vite](https://github.com/vitejs/vite) as build tool
- [UnoCSS](https://github.com/unocss/unocss) for styling

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm serve
```

## Requirements

- A MIDI piano or keyboard that can be connected via USB
- A browser with WebMIDI support (Chrome, Edge, Opera)

## Deployment

The app is automatically deployed to GitHub Pages on every push to the `main` branch.

Live Demo: [https://alexvoedi.github.io/piano-trainer/](https://alexvoedi.github.io/piano-trainer/)

## License

MIT
