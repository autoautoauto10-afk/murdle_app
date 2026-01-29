'use client';

import React from 'react';
import { Entity } from '@/types/game';

interface FinalAnswerProps {
    suspects: Entity[];
    weapons: Entity[];
    locations: Entity[];
    onCheck: (s: string, w: string, l: string) => void;
}

export default function FinalAnswer({ suspects, weapons, locations, onCheck }: FinalAnswerProps) {
    const [s, setS] = React.useState('');
    const [w, setW] = React.useState('');
    const [l, setL] = React.useState('');

    return (
        <div className="bg-stone-800 text-stone-100 p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-6 text-center text-amber-400">Final Verdict</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-stone-400">The Culprit</label>
                    <select
                        value={s}
                        onChange={(e) => setS(e.target.value)}
                        className="w-full bg-stone-700 border-2 border-stone-600 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                        <option value="">Select Suspect</option>
                        {suspects.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-stone-400">The Weapon</label>
                    <select
                        value={w}
                        onChange={(e) => setW(e.target.value)}
                        className="w-full bg-stone-700 border-2 border-stone-600 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                        <option value="">Select Weapon</option>
                        {weapons.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-stone-400">The Location</label>
                    <select
                        value={l}
                        onChange={(e) => setL(e.target.value)}
                        className="w-full bg-stone-700 border-2 border-stone-600 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                        <option value="">Select Location</option>
                        {locations.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button
                onClick={() => onCheck(s, w, l)}
                disabled={!s || !w || !l}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-stone-600 text-stone-900 font-bold py-4 rounded-lg transform transition-transform active:scale-95 text-lg uppercase tracking-widest shadow-lg"
            >
                Submit Findings
            </button>
        </div>
    );
}
