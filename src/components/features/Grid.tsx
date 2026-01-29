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
            <table className="border-collapse" style={{ borderSpacing: 0 }}>
                {!hideColumnHeaders && (
                    <thead>
                        <tr>
                            <th className={`${cellSize} border-2 border-stone-800 bg-stone-100`}></th>
                            {category2.map((item) => (
                                <th
                                    key={item.id}
                                    className={`${cellSize} border-2 border-stone-800 bg-stone-200 text-xs font-bold p-1 align-middle text-center`}
                                >
                                    <div className="rotate-[-45deg] whitespace-nowrap text-[10px]">{item.name}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {category1.map((item1) => (
                        <tr key={item1.id}>
                            {!hideRowHeaders && (
                                <th className={`${cellSize} border-2 border-stone-800 bg-stone-200 text-xs font-bold p-1 text-left`}>
                                    <div className="text-[10px]">{item1.name}</div>
                                </th>
                            )}
                            {category2.map((item2) => {
                                const key = `${item1.id}:${item2.id}`;
                                const cellMark: CellMark = gridState[key] || { state: 'empty', isAutoFilled: false };
                                const { state, isAutoFilled } = cellMark;

                                return (
                                    <td
                                        key={item2.id}
                                        onClick={() => onCellClick(item1.id, item2.id)}
                                        className={`${cellSize} border-2 border-stone-800 bg-white cursor-pointer hover:bg-stone-50 transition-colors relative`}
                                    >
                                        <div className="flex items-center justify-center w-full h-full">
                                            {state === 'circle' && (
                                                <div className={`${iconSize} rounded-full border-4 border-green-600 flex items-center justify-center`}>
                                                    <div className={`${circleSize} rounded-full bg-green-600`}></div>
                                                </div>
                                            )}
                                            {state === 'cross' && (
                                                <X
                                                    className={`${iconSize} ${isAutoFilled ? 'text-red-300' : 'text-red-600'}`}
                                                    strokeWidth={3}
                                                />
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
