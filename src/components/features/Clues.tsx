'use client';

import React from 'react';
import { Hint } from '@/types/game';

interface CluesProps {
    hints: Hint[];
    onToggleHint: (id: string) => void;
}

export default function Clues({ hints, onToggleHint }: CluesProps) {
    return (
        <div className="bg-stone-50 p-6 rounded-lg border-2 border-stone-300 shadow-inner mb-8">
            <h2 className="text-xl font-serif font-bold mb-4 border-b-2 border-stone-400 pb-2">Clues</h2>
            <ul className="space-y-3">
                {hints.map((hint) => (
                    <li
                        key={hint.id}
                        onClick={() => onToggleHint(hint.id)}
                        className={`cursor-pointer transition-all ${hint.isStrikethrough
                                ? 'text-stone-400 line-through decoration-stone-500'
                                : 'text-stone-800 hover:text-stone-600'
                            }`}
                    >
                        <span className="inline-block w-4 mr-2 text-stone-400">•</span>
                        {hint.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}
