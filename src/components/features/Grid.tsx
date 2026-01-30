'use client';

import React from 'react';
import { Entity, GridState, CellMark } from '@/types/game';
import { X } from 'lucide-react';

interface GridProps {
    category1: Entity[];
    category2: Entity[];
    gridState: GridState;
    onCellClick: (id1: string, id2: string) => void;
    label?: string;
    compact?: boolean;
    hideRowHeaders?: boolean;
    hideColumnHeaders?: boolean;
}

export default function Grid({
    category1,
    category2,
    gridState,
    onCellClick,
    label,
    compact = false,
    hideRowHeaders = false,
    hideColumnHeaders = false
}: GridProps) {
    return (
        <div className={compact ? '' : 'mb-6'}>
            {label && !compact && <h3 className="text-sm font-bold mb-2 text-stone-600">{label}</h3>}
            <div className="inline-block">
                <table className="border-collapse" style={{ borderSpacing: 0 }}>
                    {!hideColumnHeaders && (
                        <thead>
                            <tr>
                                {!hideRowHeaders && <th className="aspect-square border-2 border-stone-800 bg-stone-100"></th>}
                                {category2.map((item) => (
                                    <th
                                        key={item.id}
                                        className="aspect-square border-2 border-stone-800 bg-stone-200 text-xs font-bold p-1 align-middle text-center min-w-[48px]"
                                    >
                                        <div className="flex items-center justify-center h-full">
                                            <div className="whitespace-normal break-words leading-tight text-[10px]">{item.name}</div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {category1.map((row) => (
                            <tr key={row.id}>
                                {!hideRowHeaders && (
                                    <th className="aspect-square border-2 border-stone-800 bg-stone-300 text-xs font-bold p-1 align-middle text-center min-w-[48px]">
                                        <div className="flex items-center justify-center h-full">
                                            <div className="whitespace-normal break-words leading-tight text-[10px]">{row.name}</div>
                                        </div>
                                    </th>
                                )}
                                {category2.map((col) => {
                                    const key = `${row.id}:${col.id}`;
                                    const cellMark: CellMark = gridState[key] || { state: 'empty', isAutoFilled: false };
                                    const { state, isAutoFilled } = cellMark;

                                    return (
                                        <td
                                            key={col.id}
                                            className="aspect-square border-2 border-stone-800 bg-stone-50 hover:bg-stone-200 cursor-pointer transition-colors relative min-w-[48px]"
                                            onClick={() => onCellClick(row.id, col.id)}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                {state === 'circle' && (
                                                    <div className="relative w-8 h-8">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                        </div>
                                                        <div className="relative flex items-center justify-center">
                                                            <div className="w-8 h-8 border-[3px] border-green-600 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {state === 'cross' && (
                                                    <X className={`w-8 h-8 ${isAutoFilled ? 'text-red-300' : 'text-red-600'} stroke-[3px]`} />
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
