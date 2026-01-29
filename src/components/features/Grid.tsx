'use client';

import React from 'react';
import { Entity, GridState, CellState } from '@/types/game';
import { X, Check } from 'lucide-react';

interface GridProps {
    category1: Entity[];
    category2: Entity[];
    gridState: GridState;
    onCellClick: (id1: string, id2: string) => void;
}

export default function Grid({ category1, category2, gridState, onCellClick }: GridProps) {
    return (
        <div className="overflow-x-auto pb-4">
            <table className="border-collapse mx-auto">
                <thead>
                    <tr>
                        <th className="w-20 h-20 border-2 border-stone-800 bg-stone-100"></th>
                        {category2.map((item) => (
                            <th
                                key={item.id}
                                className="w-20 h-20 border-2 border-stone-800 bg-stone-200 text-xs font-bold p-1 align-middle text-center"
                            >
                                <div className="rotate-[-45deg] whitespace-nowrap">{item.name}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {category1.map((item1) => (
                        <tr key={item1.id}>
                            <th className="w-20 h-20 border-2 border-stone-800 bg-stone-200 text-xs font-bold p-1 text-left">
                                {item1.name}
                            </th>
                            {category2.map((item2) => {
                                const key = `${item1.id}:${item2.id}`;
                                const state = gridState[key] || 'empty';
                                return (
                                    <td
                                        key={item2.id}
                                        onClick={() => onCellClick(item1.id, item2.id)}
                                        className="w-20 h-20 border-2 border-stone-800 bg-white cursor-pointer hover:bg-stone-50 transition-colors relative"
                                    >
                                        <div className="flex items-center justify-center w-full h-full">
                                            {state === 'circle' && (
                                                <div className="w-12 h-12 rounded-full border-4 border-green-600 flex items-center justify-center">
                                                    <div className="w-4 h-4 rounded-full bg-green-600"></div>
                                                </div>
                                            )}
                                            {state === 'cross' && <X className="text-red-600 w-12 h-12" strokeWidth={3} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
