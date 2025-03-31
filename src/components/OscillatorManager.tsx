import { useEffect, useRef, useState } from 'react';
import { Oscillator, Interval, NOTE_TO_FREQUENCY, INTERVAL_RATIOS, OscillatorMode } from '../types';

export function OscillatorManager() {
    const [oscillators, setOscillators] = useState<Oscillator[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorNodesRef = useRef<{ [key: string]: OscillatorNode }>({});

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        return () => {
            // Cleanup oscillators when component unmounts
            Object.values(oscillatorNodesRef.current).forEach(osc => {
                osc.stop();
            });
        };
    }, []);

    const createOscillator = () => {
        const newOscillator: Oscillator = {
            id: crypto.randomUUID(),
            frequency: 440, // A4 as default
            mode: 'absolute-frequency',
            isPlaying: false,
        };
        setOscillators(prev => [...prev, newOscillator]);
    };

    const deleteOscillator = (id: string) => {
        if (oscillatorNodesRef.current[id]) {
            oscillatorNodesRef.current[id].stop();
            delete oscillatorNodesRef.current[id];
        }
        // Remove this oscillator as a dependency for others
        setOscillators(prev =>
            prev.filter(osc => osc.id !== id)
                .map(osc => {
                    if (osc.dependsOn === id) {
                        return { ...osc, mode: 'absolute-frequency', dependsOn: undefined };
                    }
                    return osc;
                })
        );
    };

    const toggleOscillator = (oscillator: Oscillator) => {
        if (!audioContextRef.current) return;

        if (oscillator.isPlaying) {
            if (oscillatorNodesRef.current[oscillator.id]) {
                oscillatorNodesRef.current[oscillator.id].stop();
                delete oscillatorNodesRef.current[oscillator.id];
            }
        } else {
            const osc = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            osc.type = 'sine';
            osc.frequency.value = oscillator.frequency;
            gainNode.gain.value = 0.1;
            osc.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            osc.start();
            oscillatorNodesRef.current[oscillator.id] = osc;
        }

        setOscillators(prev =>
            prev.map(osc =>
                osc.id === oscillator.id ? { ...osc, isPlaying: !osc.isPlaying } : osc
            )
        );
    };

    const updateFrequency = (id: string, frequency: number) => {
        if (oscillatorNodesRef.current[id]) {
            oscillatorNodesRef.current[id].frequency.value = frequency;
        }
        setOscillators(prev => {
            const updatedOscillators = prev.map(osc =>
                osc.id === id ? { ...osc, frequency } : osc
            );
            // Update dependent oscillators
            return updatedOscillators.map(osc => {
                if (osc.dependsOn === id) {
                    const baseOsc = updatedOscillators.find(o => o.id === id);
                    if (baseOsc) {
                        if (osc.mode === 'relative-interval' && osc.interval) {
                            const newFrequency = baseOsc.frequency * INTERVAL_RATIOS[osc.interval];
                            // Update the audio node frequency if it exists
                            if (oscillatorNodesRef.current[osc.id]) {
                                oscillatorNodesRef.current[osc.id].frequency.value = newFrequency;
                            }
                            return {
                                ...osc,
                                frequency: newFrequency
                            };
                        }
                    }
                }
                return osc;
            });
        });
    };

    const setMode = (id: string, mode: OscillatorMode) => {
        setOscillators(prev => {
            const updatedOscillators = prev.map(osc =>
                osc.id === id ? { ...osc, mode, dependsOn: undefined } : osc
            );
            // If switching to relative-interval, set dependency to previous oscillator
            if (mode === 'relative-interval') {
                const currentIndex = updatedOscillators.findIndex(osc => osc.id === id);
                if (currentIndex > 0) {
                    const previousOsc = updatedOscillators[currentIndex - 1];
                    return updatedOscillators.map(osc =>
                        osc.id === id ? { ...osc, dependsOn: previousOsc.id } : osc
                    );
                }
            }
            return updatedOscillators;
        });
    };

    const setNote = (id: string, note: string) => {
        const frequency = NOTE_TO_FREQUENCY[note];
        if (frequency) {
            updateFrequency(id, frequency);
            setOscillators(prev =>
                prev.map(osc =>
                    osc.id === id ? { ...osc, note } : osc
                )
            );
        }
    };

    const setInterval = (id: string, interval: Interval) => {
        setOscillators(prev => {
            const oscillator = prev.find(osc => osc.id === id);
            if (!oscillator) return prev;

            const baseOsc = oscillator.dependsOn ?
                prev.find(osc => osc.id === oscillator.dependsOn) :
                undefined;

            if (!baseOsc) return prev;

            const newFrequency = baseOsc.frequency * INTERVAL_RATIOS[interval];
            if (newFrequency >= 100 && newFrequency <= 3000) {
                // Update the audio node frequency if it exists
                if (oscillatorNodesRef.current[id]) {
                    oscillatorNodesRef.current[id].frequency.value = newFrequency;
                }
                return prev.map(osc =>
                    osc.id === id ? { ...osc, interval, frequency: newFrequency } : osc
                );
            }
            return prev;
        });
    };

    return (
        <div className="oscillator-manager">
            <h2>Ear Training Oscillators</h2>
            <button onClick={createOscillator}>Add Oscillator</button>

            <div className="oscillators-list">
                {oscillators.map(oscillator => (
                    <div key={oscillator.id} className="oscillator-controls">
                        <div className="oscillator-header">
                            <h3>Oscillator {oscillators.indexOf(oscillator) + 1}</h3>
                            <button onClick={() => deleteOscillator(oscillator.id)}>Delete</button>
                        </div>

                        <div className="mode-control">
                            <label>
                                Mode:
                                <select
                                    value={oscillator.mode}
                                    onChange={(e) => setMode(oscillator.id, e.target.value as OscillatorMode)}
                                >
                                    <option value="absolute-frequency">Absolute Frequency</option>
                                    <option value="absolute-note">Absolute Note</option>
                                    <option value="relative-interval">Relative Interval</option>
                                </select>
                            </label>
                        </div>

                        {oscillator.mode === 'absolute-frequency' && (
                            <div className="frequency-control">
                                <label>
                                    Frequency: {oscillator.frequency.toFixed(2)} Hz
                                    <div className="frequency-sliders">
                                        <div className="slider-group">
                                            <label>Coarse (1 Hz steps)</label>
                                            <input
                                                type="range"
                                                min="100"
                                                max="3000"
                                                step="1"
                                                value={Math.floor(oscillator.frequency)}
                                                onChange={(e) => {
                                                    const coarse = Number(e.target.value);
                                                    const fine = oscillator.frequency % 1;
                                                    updateFrequency(oscillator.id, coarse + fine);
                                                }}
                                            />
                                        </div>
                                        <div className="slider-group">
                                            <label>Fine (0.01 Hz steps)</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="99"
                                                step="1"
                                                value={Math.floor((oscillator.frequency % 1) * 100)}
                                                onChange={(e) => {
                                                    const coarse = Math.floor(oscillator.frequency);
                                                    const fine = Number(e.target.value) / 100;
                                                    updateFrequency(oscillator.id, coarse + fine);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        {oscillator.mode === 'absolute-note' && (
                            <div className="note-control">
                                <label>
                                    Note:
                                    <select
                                        value={oscillator.note || ''}
                                        onChange={(e) => setNote(oscillator.id, e.target.value)}
                                    >
                                        <option value="">Select a note</option>
                                        {Object.keys(NOTE_TO_FREQUENCY).map(note => (
                                            <option key={note} value={note}>{note}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="frequency-display">
                                    Frequency: {oscillator.frequency.toFixed(2)} Hz
                                </div>
                            </div>
                        )}

                        {oscillator.mode === 'relative-interval' && (
                            <div className="interval-control">
                                <label>
                                    Interval:
                                    <select
                                        value={oscillator.interval || ''}
                                        onChange={(e) => setInterval(oscillator.id, e.target.value as Interval)}
                                    >
                                        <option value="">Select an interval</option>
                                        {Object.keys(INTERVAL_RATIOS).map(interval => (
                                            <option key={interval} value={interval}>{interval}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="frequency-display">
                                    Frequency: {oscillator.frequency.toFixed(2)} Hz
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => toggleOscillator(oscillator)}
                            className={oscillator.isPlaying ? 'playing' : ''}
                        >
                            {oscillator.isPlaying ? 'Stop' : 'Play'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
} 