'use client';

import React from 'react';
import { Entity, MultiGridState } from '@/types/game';
import Grid from './Grid';

interface MultiGridProps {
    suspects: Entity[];
    weapons: Entity[];
    locations: Entity[];
    gridState: MultiGridState;
    onCellClick: (gridType: 'suspectWeapon' | 'suspectLocation' | 'weaponLocation', id1: string, id2: string) => void;
}

export default function MultiGrid({ suspects, weapons, locations, gridState, onCellClick }: MultiGridProps) {
    return (
        <div className="space-y-8">
            {/* Top row: Suspect vs Weapon and Suspect vs Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Grid
                    category1={suspects}
                    category2={weapons}
                    gridState={gridState.suspectWeapon}
                    onCellClick={(id1, id2) => onCellClick('suspectWeapon', id1, id2)}
                    label="容疑者 × 凶器"
                />
                <Grid
                    category1={suspects}
                    category2={locations}
                    gridState={gridState.suspectLocation}
                    onCellClick={(id1, id2) => onCellClick('suspectLocation', id1, id2)}
                    label="容疑者 × 場所"
                />
            </div>

            {/* Bottom row: Weapon vs Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Grid
                    category1={weapons}
                    category2={locations}
                    gridState={gridState.weaponLocation}
                    onCellClick={(id1, id2) => onCellClick('weaponLocation', id1, id2)}
                    label="凶器 × 場所"
                />
                <div className="hidden lg:block"></div> {/* Spacer for layout */}
            </div>
        </div>
    );
}
