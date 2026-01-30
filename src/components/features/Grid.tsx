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
    const cellSize = compact ? 'w-12 h-12' : 'w-16 h-16';
    const iconSize = compact ? 'w-8 h-8' : 'w-10 h-10';
    const circleSize = compact ? 'w-2 h-2' : 'w-3 h-3';

    return (
        <div className={compact ? '' : 'mb-8'}>
            {label && !compact && <h3 className="text-sm font-bold mb-2 text-stone-600">{label}</h3>}
            <table className="border-collapse table-fixed" style={{ borderSpacing: 0 }}>
                {!hideColumnHeaders && (
                    <thead>
                        <tr>
                            {!hideRowHeaders && <th className="w-16 h-16 border-2 border-stone-800 bg-stone-100"></th>}
                            {category2.map((item) => (
                                <th
                                    key={item.id}
                                    className="w-16 h-16 border-2 border-stone-800 bg-stone-200 text-xs font-bold p-1 align-middle text-center"
                                >
                                    <div className="whitespace-normal break-words leading-tight text-[10px]">{item.name}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {category1.map((row) => (
                        <tr key={row.id}>
                            {!hideRowHeaders && (
                                <th className="w-16 h-16 border-2 border-stone-800 bg-stone-300 text-xs font-bold p-1 whitespace-normal break-words leading-tight text-center">
                                    {row.name}
                                </th>
                            )}
                            {category2.map((col) => {
                                const key = `${row.id}:${col.id}`;
                                const cellMark: CellMark = gridState[key] || { state: 'empty', isAutoFilled: false };
                                const { state, isAutoFilled } = cellMark;

                                return (
                                    <td
                                        key={col.id}
                                        className="w-16 h-16 border-2 border-stone-800 bg-stone-50 hover:bg-stone-200 cursor-pointer transition-colors relative"
                                        onClick={() => onCellClick(row.id, col.id)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {state === 'circle' && (
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                                    </div>
                                                    <div className="relative flex items-center justify-center">
                                                        <div className="w-10 h-10 border-4 border-green-600 rounded-full"></div>
                                                    </div>
                                                </div>
                                            )}
                                            {state === 'cross' && (
                                                <X className={`w-10 h-10 ${isAutoFilled ? 'text-red-300' : 'text-red-600'} stroke-[3px]`} />
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
    );
}
