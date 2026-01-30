'use client';

import React from 'react';
import { Entity, MultiGridState, CellMark } from '@/types/game';
import { X } from 'lucide-react';

interface UnifiedGridProps {
    suspects: Entity[];
    weapons: Entity[];
    locations: Entity[];
    gridState: MultiGridState;
    onCellClick: (gridType: 'suspectWeapon' | 'suspectLocation' | 'weaponLocation', id1: string, id2: string) => void;
}

export default function UnifiedGrid({ suspects, weapons, locations, gridState, onCellClick }: UnifiedGridProps) {
    const suspectCount = suspects.length;
    const weaponCount = weapons.length;
    const locationCount = locations.length;

    // Grid layout configuration
    const gridTemplateColumns = `60px repeat(${weaponCount}, 1fr) repeat(${locationCount}, 1fr)`;
    const gridTemplateRows = `40px repeat(${suspectCount}, 1fr) repeat(${locationCount}, 1fr)`;

    return (
        <div className="w-full overflow-x-auto px-4 py-2">
            <div
                className="inline-grid border-2 border-stone-800"
                style={{
                    gridTemplateColumns,
                    gridTemplateRows,
                    minWidth: 'fit-content',
                }}
            >
                {/* Top-left corner (empty) */}
                <div
                    className="bg-stone-100 border-r-2 border-b-2 border-stone-800"
                    style={{ gridColumn: 1, gridRow: 1 }}
                />

                {/* Header: Weapons */}
                {weapons.map((weapon, idx) => (
                    <div
                        key={weapon.id}
                        className={`bg-stone-200 border-b-2 border-stone-800 p-1 flex items-center justify-center min-w-[36px] min-h-[36px] ${idx === weaponCount - 1 ? 'border-r-4' : 'border-r border-stone-400'
                            }`}
                        style={{
                            gridColumn: 2 + idx,
                            gridRow: 1
                        }}
                    >
                        <div className="text-[9px] font-bold text-center leading-tight break-words">
                            {weapon.name}
                        </div>
                    </div>
                ))}

                {/* Header: Locations */}
                {locations.map((location, idx) => (
                    <div
                        key={location.id}
                        className="bg-stone-200 border-b-2 border-stone-800 border-r border-stone-400 p-1 flex items-center justify-center min-w-[36px] min-h-[36px]"
                        style={{
                            gridColumn: 2 + weaponCount + idx,
                            gridRow: 1
                        }}
                    >
                        <div className="text-[9px] font-bold text-center leading-tight break-words">
                            {location.name}
                        </div>
                    </div>
                ))}

                {/* Row headers: Suspects */}
                {suspects.map((suspect, idx) => (
                    <div
                        key={suspect.id}
                        className={`bg-stone-300 border-r-2 border-stone-800 p-1 flex items-center justify-center min-w-[60px] min-h-[36px] ${idx === suspectCount - 1 ? 'border-b-4' : 'border-b border-stone-400'
                            }`}
                        style={{
                            gridColumn: 1,
                            gridRow: 2 + idx
                        }}
                    >
                        <div className="text-[9px] font-bold text-center leading-tight break-words">
                            {suspect.name}
                        </div>
                    </div>
                ))}

                {/* Row headers: Locations (for weapon-location grid) */}
                {locations.map((location, idx) => (
                    <div
                        key={`loc-header-${location.id}`}
                        className="bg-stone-300 border-r-2 border-b border-stone-400 border-stone-800 p-1 flex items-center justify-center min-w-[60px] min-h-[36px]"
                        style={{
                            gridColumn: 1,
                            gridRow: 2 + suspectCount + idx
                        }}
                    >
                        <div className="text-[9px] font-bold text-center leading-tight break-words">
                            {location.name}
                        </div>
                    </div>
                ))}

                {/* Cells: Suspect × Weapon */}
                {suspects.map((suspect, suspectIdx) =>
                    weapons.map((weapon, weaponIdx) => {
                        const key = `${suspect.id}:${weapon.id}`;
                        const cellMark: CellMark = gridState.suspectWeapon[key] || { state: 'empty', isAutoFilled: false };
                        const { state, isAutoFilled } = cellMark;
                        const isLastCol = weaponIdx === weaponCount - 1;
                        const isLastRow = suspectIdx === suspectCount - 1;

                        return (
                            <div
                                key={key}
                                className={`bg-stone-50 hover:bg-stone-200 cursor-pointer transition-colors relative min-w-[36px] min-h-[36px] 
                                    ${isLastCol ? 'border-r-4' : 'border-r border-stone-400'} 
                                    ${isLastRow ? 'border-b-4' : 'border-b border-stone-400'}
                                    border-stone-800`}
                                style={{
                                    gridColumn: 2 + weaponIdx,
                                    gridRow: 2 + suspectIdx
                                }}
                                onClick={() => onCellClick('suspectWeapon', suspect.id, weapon.id)}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {state === 'circle' && (
                                        <div className="relative w-6 h-6">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                            </div>
                                            <div className="relative flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-green-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                    {state === 'cross' && (
                                        <X className={`w-6 h-6 ${isAutoFilled ? 'text-red-300' : 'text-red-600'} stroke-[2.5px]`} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Cells: Suspect × Location */}
                {suspects.map((suspect, suspectIdx) =>
                    locations.map((location, locationIdx) => {
                        const key = `${suspect.id}:${location.id}`;
                        const cellMark: CellMark = gridState.suspectLocation[key] || { state: 'empty', isAutoFilled: false };
                        const { state, isAutoFilled } = cellMark;
                        const isLastRow = suspectIdx === suspectCount - 1;

                        return (
                            <div
                                key={key}
                                className={`bg-stone-50 hover:bg-stone-200 cursor-pointer transition-colors relative min-w-[36px] min-h-[36px] 
                                    border-r border-stone-400
                                    ${isLastRow ? 'border-b-4' : 'border-b border-stone-400'}
                                    border-stone-800`}
                                style={{
                                    gridColumn: 2 + weaponCount + locationIdx,
                                    gridRow: 2 + suspectIdx
                                }}
                                onClick={() => onCellClick('suspectLocation', suspect.id, location.id)}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {state === 'circle' && (
                                        <div className="relative w-6 h-6">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                            </div>
                                            <div className="relative flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-green-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                    {state === 'cross' && (
                                        <X className={`w-6 h-6 ${isAutoFilled ? 'text-red-300' : 'text-red-600'} stroke-[2.5px]`} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Cells: Location × Weapon (transposed) */}
                {locations.map((location, locationIdx) =>
                    weapons.map((weapon, weaponIdx) => {
                        const key = `${weapon.id}:${location.id}`;
                        const cellMark: CellMark = gridState.weaponLocation[key] || { state: 'empty', isAutoFilled: false };
                        const { state, isAutoFilled } = cellMark;
                        const isLastCol = weaponIdx === weaponCount - 1;

                        return (
                            <div
                                key={key}
                                className={`bg-stone-50 hover:bg-stone-200 cursor-pointer transition-colors relative min-w-[36px] min-h-[36px] 
                                    ${isLastCol ? 'border-r-4' : 'border-r border-stone-400'}
                                    border-b border-stone-400
                                    border-stone-800`}
                                style={{
                                    gridColumn: 2 + weaponIdx,
                                    gridRow: 2 + suspectCount + locationIdx
                                }}
                                onClick={() => onCellClick('weaponLocation', weapon.id, location.id)}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {state === 'circle' && (
                                        <div className="relative w-6 h-6">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                            </div>
                                            <div className="relative flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-green-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                    {state === 'cross' && (
                                        <X className={`w-6 h-6 ${isAutoFilled ? 'text-red-300' : 'text-red-600'} stroke-[2.5px]`} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
