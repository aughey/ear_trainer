# Ear Trainer

A web application designed to help musicians develop their relative pitch and interval recognition skills by generating and comparing audio frequencies.

## Description

Ear Trainer is an interactive tool that allows users to:

- Create multiple audio oscillators with customizable frequencies
- Play pure sine wave tones for reference and practice
- Compare musical intervals side-by-side
- View the cents difference between tones
- Control frequencies using coarse and fine adjustments
- Generate tones based on standard musical notes (C4-C6)
- Create intervals relative to other tones

This application is particularly useful for:
- Ear training for musicians
- Learning to recognize musical intervals
- Developing a sense of relative pitch
- Understanding the mathematical relationships between intervals

## Features

- **Multiple oscillators**: Create and manage multiple tone generators
- **Three operation modes**:
  - Absolute Frequency: Set exact frequencies in Hz
  - Absolute Note: Select from standard musical notes
  - Relative Interval: Create perfect intervals based on another oscillator
- **Real-time analysis**: View the cents difference between tones
- **Precise control**: Fine-tune frequencies with coarse/fine adjustment sliders

## Technologies

- React 19
- TypeScript
- Vite
- Web Audio API

## Live Demo

Try the application online: [https://aughey.github.io/ear_trainer/](https://aughey.github.io/ear_trainer/)

## Development

### Prerequisites
- Node.js (v18+)
- Yarn

### Setup
1. Clone the repository
```bash
git clone https://github.com/aughey/ear_trainer.git
cd ear_trainer
```

2. Install dependencies
```bash
yarn install
```

3. Run the development server
```bash
yarn dev
```

4. Build for production
```bash
yarn build
```

## License

MIT
