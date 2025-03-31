import { useState, useEffect } from 'react';

interface CoarseFineFrequencyProps {
    value: number;
    onChange: (frequency: number) => void;
}

export function CoarseFineFrequency({ value, onChange }: CoarseFineFrequencyProps) {
    const [coarse, setCoarse] = useState(Math.floor(value));
    const [fine, setFine] = useState(value - Math.floor(value));

    useEffect(() => {
        onChange(coarse + fine);
    }, [coarse, fine, onChange]);

    return (
        <div className="frequency-control">
            <label>
                Frequency: {(coarse + fine).toFixed(2)} Hz
                <div className="frequency-sliders">
                    <div className="slider-group">
                        <label>Coarse (100-3000 Hz)</label>
                        <input
                            type="range"
                            min="100"
                            max="3000"
                            step="1"
                            value={coarse}
                            onChange={(e) => setCoarse(Number(e.target.value))}
                        />
                    </div>
                    <div className="slider-group">
                        <label>Fine (±4 Hz)</label>
                        <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={Math.round(fine * 10)}
                            onChange={(e) => setFine(Number(e.target.value) / 10)}
                        />
                        <span className="fine-tune-value">
                            {fine.toFixed(1)} Hz
                        </span>
                    </div>
                </div>
            </label>
        </div>
    );
} 