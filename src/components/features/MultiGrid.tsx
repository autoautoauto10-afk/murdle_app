'use client';

import React, { useMemo } from 'react';
import { Entity, MultiGridState, GridState } from '@/types/game';
import Grid from './Grid';

interface MultiGridProps {
    suspects: Entity[];
    weapons: Entity[];
    locations: Entity[];
    gridState: MultiGridState;
    onCellClick: (gridType: 'suspectWeapon' | 'suspectLocation' | 'weaponLocation', id1: string, id2: string) => void;
}

export default function MultiGrid({ suspects, weapons, locations, gridState, onCellClick }: MultiGridProps) {

    // UI表示用に、下段グリッド（凶器×場所）のデータを「場所×凶器」に転置（Transpose）する
    // これにより、上段左のグリッド（容疑者×凶器）と、下段のグリッドの「凶器」列（縦ライン）が揃います。
    const transposedWeaponLocationState = useMemo(() => {
        const transposed: GridState = {};

        // 場所IDを行キー (Category1)、凶器IDを列キー (Category2) にする構造へ変換
        locations.forEach(loc => {
            weapons.forEach(weap => {
                // 元のデータ構造は Flat Map "WeaponID:LocationID"
                const originalKey = `${weap.id}:${loc.id}`;
                // 新しいキーは "LocationID:WeaponID" (Category1:Location, Category2:Weapon)
                const newKey = `${loc.id}:${weap.id}`;

                const cellMark = gridState.weaponLocation[originalKey];
                if (cellMark) {
                    transposed[newKey] = cellMark;
                }
            });
        });
        return transposed;
    }, [gridState.weaponLocation, weapons, locations]);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-2">
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* 上段: 容疑者 vs 凶器 | 容疑者 vs 場所 */}
                    <div className="flex gap-2 mb-2">
                        <Grid
                            category1={suspects}
                            category2={weapons}
                            gridState={gridState.suspectWeapon}
                            onCellClick={(id1, id2) => onCellClick('suspectWeapon', id1, id2)}
                            label="容疑者 × 凶器"
                            compact={true}
                        />
                        <Grid
                            category1={suspects}
                            category2={locations}
                            gridState={gridState.suspectLocation}
                            onCellClick={(id1, id2) => onCellClick('suspectLocation', id1, id2)}
                            label="容疑者 × 場所"
                            compact={true}
                            hideRowHeaders={true}
                        />
                    </div>

                    {/* 下段: 場所 vs 凶器 （データを転置して表示） */}
                    {/* category1を場所(行)、category2を凶器(列)に設定することで、上のグリッドと列が揃う */}
                    <div className="flex">
                        <Grid
                            category1={locations}
                            category2={weapons}
                            gridState={transposedWeaponLocationState} // 転置したStateを使用
                            // クリックイベントは元のデータ構造 (凶器ID, 場所ID) に戻して親に渡す
                            onCellClick={(locId, weapId) => onCellClick('weaponLocation', weapId, locId)}
                            label="場所 × 凶器"
                            compact={true}
                            hideColumnHeaders={true} // 上のグリッドのヘッダーと列が揃うため、ヘッダーは隠す
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
