import { PuzzleData, Entity, Hint, GridState } from '@/types/game';

interface Solution {
    [suspectId: string]: {
        weaponId: string;
        locationId: string;
    };
}

// Simplified solver that ONLY uses hints, NO cheating with solution
class PuzzleSolver {
    private suspects: Entity[];
    private weapons: Entity[];
    private locations: Entity[];
    private hints: Hint[];
    private grid: GridState;

    constructor(
        suspects: Entity[],
        weapons: Entity[],
        locations: Entity[],
        hints: Hint[]
    ) {
        this.suspects = suspects;
        this.weapons = weapons;
        this.locations = locations;
        this.hints = hints;
        this.grid = {};
    }

    // Initialize grid with ALL cells as 'empty'
    private initializeGrid(): void {
        // Suspect-Weapon grid
        this.suspects.forEach(suspect => {
            this.weapons.forEach(weapon => {
                const key = `${suspect.id}:${weapon.id}`;
                this.grid[key] = { state: 'empty', isAutoFilled: false };
            });
        });

        // Suspect-Location grid
        this.suspects.forEach(suspect => {
            this.locations.forEach(location => {
                const key = `${suspect.id}:${location.id}`;
                this.grid[key] = { state: 'empty', isAutoFilled: false };
            });
        });

        // Weapon-Location grid
        this.weapons.forEach(weapon => {
            this.locations.forEach(location => {
                const key = `${weapon.id}:${location.id}`;
                this.grid[key] = { state: 'empty', isAutoFilled: false };
            });
        });
    }

    // Apply all hints and deduce as much as possible
    solve(): void {
        this.initializeGrid();

        // Apply each hint
        this.hints.forEach(hint => {
            this.parseAndApplyHint(hint);
        });

        // Apply deduction rules iteratively until no more changes
        let changed = true;
        let iterations = 0;
        const maxIterations = 50;

        while (changed && iterations < maxIterations) {
            changed = this.applyDeductionRules();
            iterations++;
        }
    }

    // Parse hint text and apply to grid
    private parseAndApplyHint(hint: Hint): void {
        const text = hint.text.replace('🚨 ', '');

        // Pattern: "AはBを使った" (A used B)
        const usedPattern = /(.+)は(.+)を使った/;
        const usedMatch = text.match(usedPattern);
        if (usedMatch) {
            const suspectName = usedMatch[1];
            const weaponName = usedMatch[2];
            const suspect = this.suspects.find(s => s.name === suspectName);
            const weapon = this.weapons.find(w => w.name === weaponName);
            if (suspect && weapon) {
                this.grid[`${suspect.id}:${weapon.id}`] = { state: 'circle', isAutoFilled: false };
            }
        }

        // Pattern: "AはBで発見された" (A was found at B)
        const foundPattern = /(.+)は(.+)で発見された/;
        const foundMatch = text.match(foundPattern);
        if (foundMatch) {
            const weaponName = foundMatch[1];
            const locationName = foundMatch[2];
            const weapon = this.weapons.find(w => w.name === weaponName);
            const location = this.locations.find(l => l.name === locationName);
            if (weapon && location) {
                this.grid[`${weapon.id}:${location.id}`] = { state: 'circle', isAutoFilled: false };
            }
        }

        // Pattern: "AはBにいた" (A was at B)
        const wasAtPattern = /(.+)は(.+)にいた/;
        const wasAtMatch = text.match(wasAtPattern);
        if (wasAtMatch) {
            const suspectName = wasAtMatch[1];
            const locationName = wasAtMatch[2];
            const suspect = this.suspects.find(s => s.name === suspectName);
            const location = this.locations.find(l => l.name === locationName);
            if (suspect && location) {
                this.grid[`${suspect.id}:${location.id}`] = { state: 'circle', isAutoFilled: false };
            }
        }

        // Negative patterns
        const notUsedPattern = /(.+)は(.+)を使っていない/;
        const notUsedMatch = text.match(notUsedPattern);
        if (notUsedMatch) {
            const suspectName = notUsedMatch[1];
            const weaponName = notUsedMatch[2];
            const suspect = this.suspects.find(s => s.name === suspectName);
            const weapon = this.weapons.find(w => w.name === weaponName);
            if (suspect && weapon) {
                this.grid[`${suspect.id}:${weapon.id}`] = { state: 'cross', isAutoFilled: false };
            }
        }

        const notAtPattern = /(.+)は(.+)にいなかった|(.+)は(.+)にはいなかった/;
        const notAtMatch = text.match(notAtPattern);
        if (notAtMatch) {
            const suspectName = notAtMatch[1] || notAtMatch[3];
            const locationName = notAtMatch[2] || notAtMatch[4];
            const suspect = this.suspects.find(s => s.name === suspectName);
            const location = this.locations.find(l => l.name === locationName);
            if (suspect && location) {
                this.grid[`${suspect.id}:${location.id}`] = { state: 'cross', isAutoFilled: false };
            }
        }

        const notUsedAtPattern = /(.+)は(.+)では使われなかった/;
        const notUsedAtMatch = text.match(notUsedAtPattern);
        if (notUsedAtMatch) {
            const weaponName = notUsedAtMatch[1];
            const locationName = notUsedAtMatch[2];
            const weapon = this.weapons.find(w => w.name === weaponName);
            const location = this.locations.find(l => l.name === locationName);
            if (weapon && location) {
                this.grid[`${weapon.id}:${location.id}`] = { state: 'cross', isAutoFilled: false };
            }
        }

        const didntHavePattern = /(.+)は(.+)を持っていなかった/;
        const didntHaveMatch = text.match(didntHavePattern);
        if (didntHaveMatch) {
            const suspectName = didntHaveMatch[1];
            const weaponName = didntHaveMatch[2];
            const suspect = this.suspects.find(s => s.name === suspectName);
            const weapon = this.weapons.find(w => w.name === weaponName);
            if (suspect && weapon) {
                this.grid[`${suspect.id}:${weapon.id}`] = { state: 'cross', isAutoFilled: false };
            }
        }
    }

    // Apply deduction rules
    private applyDeductionRules(): boolean {
        let changed = false;

        // Rule 1: If circle in row, cross out others in that row
        this.suspects.forEach(suspect => {
            const circleWeapon = this.weapons.find(weapon =>
                this.grid[`${suspect.id}:${weapon.id}`]?.state === 'circle'
            );
            if (circleWeapon) {
                this.weapons.forEach(weapon => {
                    if (weapon.id !== circleWeapon.id) {
                        const key = `${suspect.id}:${weapon.id}`;
                        if (this.grid[key]?.state === 'empty') {
                            this.grid[key] = { state: 'cross', isAutoFilled: true };
                            changed = true;
                        }
                    }
                });
            }

            const circleLocation = this.locations.find(location =>
                this.grid[`${suspect.id}:${location.id}`]?.state === 'circle'
            );
            if (circleLocation) {
                this.locations.forEach(location => {
                    if (location.id !== circleLocation.id) {
                        const key = `${suspect.id}:${location.id}`;
                        if (this.grid[key]?.state === 'empty') {
                            this.grid[key] = { state: 'cross', isAutoFilled: true };
                            changed = true;
                        }
                    }
                });
            }
        });

        this.weapons.forEach(weapon => {
            const circleLocation = this.locations.find(location =>
                this.grid[`${weapon.id}:${location.id}`]?.state === 'circle'
            );
            if (circleLocation) {
                this.locations.forEach(location => {
                    if (location.id !== circleLocation.id) {
                        const key = `${weapon.id}:${location.id}`;
                        if (this.grid[key]?.state === 'empty') {
                            this.grid[key] = { state: 'cross', isAutoFilled: true };
                            changed = true;
                        }
                    }
                });
            }
        });

        // Rule 2: If only one empty in row, it must be circle
        this.suspects.forEach(suspect => {
            const emptyWeapons = this.weapons.filter(weapon =>
                this.grid[`${suspect.id}:${weapon.id}`]?.state === 'empty'
            );
            if (emptyWeapons.length === 1) {
                this.grid[`${suspect.id}:${emptyWeapons[0].id}`] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }

            const emptyLocations = this.locations.filter(location =>
                this.grid[`${suspect.id}:${location.id}`]?.state === 'empty'
            );
            if (emptyLocations.length === 1) {
                this.grid[`${suspect.id}:${emptyLocations[0].id}`] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        this.weapons.forEach(weapon => {
            const emptyLocations = this.locations.filter(location =>
                this.grid[`${weapon.id}:${location.id}`]?.state === 'empty'
            );
            if (emptyLocations.length === 1) {
                this.grid[`${weapon.id}:${emptyLocations[0].id}`] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        // Rule 3: Triangulation (A=B, B=C => A=C)
        this.suspects.forEach(suspect => {
            // Find suspect's weapon
            const weapon = this.weapons.find(w =>
                this.grid[`${suspect.id}:${w.id}`]?.state === 'circle'
            );
            // Find suspect's location
            const location = this.locations.find(l =>
                this.grid[`${suspect.id}:${l.id}`]?.state === 'circle'
            );

            // If both found, connect weapon-location
            if (weapon && location) {
                const key = `${weapon.id}:${location.id}`;
                if (this.grid[key]?.state === 'empty') {
                    this.grid[key] = { state: 'circle', isAutoFilled: true };
                    changed = true;
                }
            }

            // Reverse: if weapon-location known, deduce suspect-location
            if (weapon) {
                const weaponLocation = this.locations.find(l =>
                    this.grid[`${weapon.id}:${l.id}`]?.state === 'circle'
                );
                if (weaponLocation) {
                    const key = `${suspect.id}:${weaponLocation.id}`;
                    if (this.grid[key]?.state === 'empty') {
                        this.grid[key] = { state: 'circle', isAutoFilled: true };
                        changed = true;
                    }
                }
            }
        });

        return changed;
    }

    // CRITICAL: Check if ALL cells are filled (NO cheating with solution!)
    isSolved(): boolean {
        // Check every single cell
        for (const suspect of this.suspects) {
            for (const weapon of this.weapons) {
                const key = `${suspect.id}:${weapon.id}`;
                if (!this.grid[key] || this.grid[key].state === 'empty') {
                    return false;
                }
            }
        }

        for (const suspect of this.suspects) {
            for (const location of this.locations) {
                const key = `${suspect.id}:${location.id}`;
                if (!this.grid[key] || this.grid[key].state === 'empty') {
                    return false;
                }
            }
        }

        for (const weapon of this.weapons) {
            for (const location of this.locations) {
                const key = `${weapon.id}:${location.id}`;
                if (!this.grid[key] || this.grid[key].state === 'empty') {
                    return false;
                }
            }
        }

        return true;
    }

    getGridState(): GridState {
        return { ...this.grid };
    }
}

export function generateLogicPuzzle(
    suspects: Entity[],
    weapons: Entity[],
    locations: Entity[],
    seed: number
): { solution: { suspectId: string; weaponId: string; locationId: string }; hints: Hint[] } {

    console.log('=== ELEGANT PUZZLE GENERATION ===');

    const random = mulberry32(seed);

    const shuffle = <T>(array: T[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const shuffledSuspects = shuffle(suspects);
    const shuffledWeapons = shuffle(weapons);
    const shuffledLocations = shuffle(locations);

    const solution = {
        suspectId: shuffledSuspects[0].id,
        weaponId: shuffledWeapons[0].id,
        locationId: shuffledLocations[0].id,
    };

    const culpritSuspect = suspects.find(s => s.id === solution.suspectId)!;
    const culpritWeapon = weapons.find(w => w.id === solution.weaponId)!;
    const culpritLocation = locations.find(l => l.id === solution.locationId)!;

    console.log('[Generator] Solution:', {
        suspect: culpritSuspect.name,
        weapon: culpritWeapon.name,
        location: culpritLocation.name
    });

    // Helper: Count unsolved cells
    function countUnsolvedCells(hints: Hint[]): number {
        const solver = new PuzzleSolver(suspects, weapons, locations, hints);
        solver.solve();

        let unsolved = 0;
        for (const suspect of suspects) {
            for (const weapon of weapons) {
                const key = `${suspect.id}:${weapon.id}`;
                const state = solver.getGridState()[key];
                if (!state || state.state === 'empty') unsolved++;
            }
            for (const location of locations) {
                const key = `${suspect.id}:${location.id}`;
                const state = solver.getGridState()[key];
                if (!state || state.state === 'empty') unsolved++;
            }
        }
        for (const weapon of weapons) {
            for (const location of locations) {
                const key = `${weapon.id}:${location.id}`;
                const state = solver.getGridState()[key];
                if (!state || state.state === 'empty') unsolved++;
            }
        }
        return unsolved;
    }

    // STRATEGY: Build hint pool with priorities and METADATA
    type HintCandidate = {
        text: string;
        priority: number;
        category: string;
        type: 'positive' | 'negative';
        entity1Id: string;
        entity2Id: string;
    };
    const hintCandidates: HintCandidate[] = [];

    // Priority 1: Core positive hints (highest impact)
    hintCandidates.push({
        text: `${culpritSuspect.name}は${culpritWeapon.name}を使った。`,
        priority: 100,
        category: 'suspect-weapon-core',
        type: 'positive',
        entity1Id: culpritSuspect.id,
        entity2Id: culpritWeapon.id
    });
    hintCandidates.push({
        text: `${culpritWeapon.name}は${culpritLocation.name}で発見された。`,
        priority: 100,
        category: 'weapon-location-core',
        type: 'positive',
        entity1Id: culpritWeapon.id,
        entity2Id: culpritLocation.id
    });

    // Priority 2: Strategic negative hints (high impact)
    suspects.forEach(suspect => {
        if (suspect.id !== solution.suspectId) {
            weapons.forEach(weapon => {
                hintCandidates.push({
                    text: `${suspect.name}は${weapon.name}を使っていない。`,
                    priority: 50,
                    category: 'suspect-weapon-negative',
                    type: 'negative',
                    entity1Id: suspect.id,
                    entity2Id: weapon.id
                });
            });
            locations.forEach(location => {
                hintCandidates.push({
                    text: `${suspect.name}は${location.name}にいなかった。`,
                    priority: 50,
                    category: 'suspect-location-negative',
                    type: 'negative',
                    entity1Id: suspect.id,
                    entity2Id: location.id
                });
            });
        }
    });

    weapons.forEach(weapon => {
        if (weapon.id !== solution.weaponId) {
            locations.forEach(location => {
                hintCandidates.push({
                    text: `${weapon.name}は${location.name}では使われなかった。`,
                    priority: 50,
                    category: 'weapon-location-negative',
                    type: 'negative',
                    entity1Id: weapon.id,
                    entity2Id: location.id
                });
            });
        }
    });

    // Shuffle within priority groups, then sort by priority
    const shuffledCandidates = shuffle(hintCandidates).sort((a, b) => b.priority - a.priority);

    console.log(`[Generator] Created ${shuffledCandidates.length} hint candidates`);

    // SMART ACCUMULATION: Add hints that make meaningful progress
    const selectedHints: Hint[] = [];
    let lastUnsolvedCount = countUnsolvedCells([]);
    let hintId = 1;

    const targetHintCount = suspects.length === 3 ? 5 : 9; // Target: 5 for 3x3, 9 for 4x4
    const maxHints = suspects.length * 3; // Safety limit

    console.log(`[Generator] Target hint count: ${targetHintCount}, Max: ${maxHints}`);
    console.log(`[Generator] Initial unsolved cells: ${lastUnsolvedCount}`);

    for (const candidate of shuffledCandidates) {
        // Try adding this hint
        const testHints = [...selectedHints, {
            id: `h${hintId}`,
            text: candidate.text,
            isStrikethrough: false
        }];

        const newUnsolvedCount = countUnsolvedCells(testHints);
        const progress = lastUnsolvedCount - newUnsolvedCount;

        // Add hint if it makes progress OR if we need more hints to reach target
        const shouldAdd = progress > 0 || (selectedHints.length < targetHintCount && newUnsolvedCount > 0);

        if (shouldAdd) {
            selectedHints.push({
                id: `h${hintId++}`,
                text: candidate.text,
                isStrikethrough: false
            });

            console.log(`[${selectedHints.length}] Added "${candidate.text}"`);
            console.log(`    Progress: ${progress} cells, Unsolved: ${newUnsolvedCount}`);

            lastUnsolvedCount = newUnsolvedCount;

            // Check if solved
            const solver = new PuzzleSolver(suspects, weapons, locations, selectedHints);
            solver.solve();
            if (solver.isSolved()) {
                console.log('✅ PUZZLE SOLVED!');
                break;
            }

            // Stop if we hit max hints
            if (selectedHints.length >= maxHints) {
                console.log('⚠️ Reached max hint limit');
                break;
            }
        }
    }

    // Final verification
    const finalSolver = new PuzzleSolver(suspects, weapons, locations, selectedHints);
    finalSolver.solve();
    const isSolvable = finalSolver.isSolved();

    console.log(`[Generator] Final hint count: ${selectedHints.length}`);
    console.log(`[Generator] Solvable: ${isSolvable}`);

    if (!isSolvable) {
        console.warn('⚠️ Puzzle is not fully solvable with current hints!');
        console.warn('Adding emergency hint to ensure solvability...');

        // Add the third core positive hint as emergency
        selectedHints.push({
            id: `h${selectedHints.length + 1}`,
            text: `${culpritSuspect.name}は${culpritLocation.name}にいた。`,
            isStrikethrough: false
        });
    }

    // Add identity clue
    const identityClueType = random() > 0.5 ? 'weapon' : 'location';
    let identityClueText = '';

    if (identityClueType === 'weapon') {
        identityClueText = `犯人は${culpritWeapon.name}を使用した痕跡がある。`;
    } else {
        identityClueText = `犯人は${culpritLocation.name}にいた形跡がある。`;
    }

    selectedHints.push({
        id: `h${selectedHints.length + 1}`,
        text: `🚨 ${identityClueText}`,
        isStrikethrough: false,
        type: 'identity'
    });

    console.log('=== GENERATION COMPLETE ===');
    console.log(`Total hints (including identity): ${selectedHints.length}`);

    return { solution, hints: selectedHints };
}

// Seedable random number generator
function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
