export type OscillatorMode = 'absolute-frequency' | 'absolute-note' | 'relative-interval';

export interface Oscillator {
    id: string;
    frequency: number;
    mode: OscillatorMode;
    note?: string;
    interval?: Interval;
    isPlaying: boolean;
    dependsOn?: string; // ID of the oscillator this one depends on
}

export type Interval = 'unison' | 'minor second' | 'major second' | 'minor third' | 'major third' | 'perfect fourth' | 'perfect fifth' | 'minor sixth' | 'major sixth' | 'minor seventh' | 'major seventh' | 'octave';

export const NOTE_TO_FREQUENCY: { [key: string]: number } = {
    // C4 to B4
    'C4': 261.63,
    'C#4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'B4': 493.88,
    // C5 to B5
    'C5': 523.25,
    'C#5': 554.37,
    'D5': 587.33,
    'D#5': 622.25,
    'E5': 659.25,
    'F5': 698.46,
    'F#5': 739.99,
    'G5': 783.99,
    'G#5': 830.61,
    'A5': 880.00,
    'A#5': 932.33,
    'B5': 987.77,
    // C6
    'C6': 1046.50
};

export const INTERVAL_RATIOS: { [key in Interval]: number } = {
    'unison': 1,
    'minor second': 16 / 15,
    'major second': 9 / 8,
    'minor third': 6 / 5,
    'major third': 5 / 4,
    'perfect fourth': 4 / 3,
    'perfect fifth': 3 / 2,
    'minor sixth': 8 / 5,
    'major sixth': 5 / 3,
    'minor seventh': 16 / 9,
    'major seventh': 15 / 8,
    'octave': 2,
}; 