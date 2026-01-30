import { PuzzleData, Entity, Hint, GridState } from '@/types/game';

interface Solution {
    [suspectId: string]: {
        weaponId: string;
        locationId: string;
    };
}

// Simple constraint solver to verify puzzle solvability
class PuzzleSolver {
    private suspects: Entity[];
    private weapons: Entity[];
    private locations: Entity[];
    private hints: Hint[];
    private grid: GridState;
    private solution: { suspectId: string; weaponId: string; locationId: string };

    constructor(
        suspects: Entity[],
        weapons: Entity[],
        locations: Entity[],
        hints: Hint[],
        solution?: { suspectId: string; weaponId: string; locationId: string }
    ) {
        this.suspects = suspects;
        this.weapons = weapons;
        this.locations = locations;
        this.hints = hints;
        this.grid = {};
        this.solution = solution || { suspectId: '', weaponId: '', locationId: '' };
    }

    // Initialize grid with empty cells
    private initializeGrid(): void {
        // Suspect-Weapon grid
        this.suspects.forEach(suspect => {
            this.weapons.forEach(weapon => {
                const key = `${suspect.id}:${weapon.id}`;
                if (!this.grid[key]) {
                    this.grid[key] = { state: 'empty', isAutoFilled: false };
                }
            });
        });

        // Suspect-Location grid
        this.suspects.forEach(suspect => {
            this.locations.forEach(location => {
                const key = `${suspect.id}:${location.id}`;
                if (!this.grid[key]) {
                    this.grid[key] = { state: 'empty', isAutoFilled: false };
                }
            });
        });

        // Weapon-Location grid
        this.weapons.forEach(weapon => {
            this.locations.forEach(location => {
                const key = `${weapon.id}:${location.id}`;
                if (!this.grid[key]) {
                    this.grid[key] = { state: 'empty', isAutoFilled: false };
                }
            });
        });
    }

    // Apply hints to the grid using basic deduction
    applyHints(): void {
        this.initializeGrid();

        // Apply each hint
        this.hints.forEach(hint => {
            this.parseAndApplyHint(hint);
        });

        // Apply deduction rules iteratively
        let changed = true;
        let iterations = 0;
        const maxIterations = 20;

        while (changed && iterations < maxIterations) {
            changed = this.applyDeductionRules();
            iterations++;
        }
    }

    // Parse hint text and apply to grid
    private parseAndApplyHint(hint: Hint): void {
        const text = hint.text.replace('🚨 ', ''); // Remove identity clue marker

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

        // Pattern: "AはBを使っていない" (A didn't use B) - negative
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

        // Pattern: "AはBにいなかった" (A wasn't at B) - negative
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

        // Pattern: "AはBでは使われなかった" (A wasn't used at B) - negative
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

        // Pattern: "AはBを持っていなかった" (A didn't have B) - negative
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

        // Identity clue patterns
        const usedTracePattern = /犯人は(.+)を使用した痕跡がある/;
        const traceMatch = text.match(usedTracePattern);
        if (traceMatch) {
            const weaponName = traceMatch[1];
            const weapon = this.weapons.find(w => w.name === weaponName);
            if (weapon && this.solution.weaponId) {
                // Mark that the culprit used this weapon (we'll need to know who the culprit is)
            }
        }

        const locationTracePattern = /犯人は(.+)にいた形跡がある/;
        const locationMatch = text.match(locationTracePattern);
        if (locationMatch) {
            const locationName = locationMatch[1];
            const location = this.locations.find(l => l.name === locationName);
            if (location && this.solution.locationId) {
                // Mark that the culprit was at this location
            }
        }
    }

    // Apply deduction rules (e.g., if one circle in row, cross out others)
    private applyDeductionRules(): boolean {
        let changed = false;

        // Rule 1: If there's a circle in a row, cross out other cells in that row
        // For Suspect-Weapon grid
        this.suspects.forEach(suspect => {
            const circleWeapon = this.weapons.find(weapon => {
                const key = `${suspect.id}:${weapon.id}`;
                return this.grid[key]?.state === 'circle';
            });

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
        });

        // For Suspect-Location grid
        this.suspects.forEach(suspect => {
            const circleLocation = this.locations.find(location => {
                const key = `${suspect.id}:${location.id}`;
                return this.grid[key]?.state === 'circle';
            });

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

        // For Weapon-Location grid
        this.weapons.forEach(weapon => {
            const circleLocation = this.locations.find(location => {
                const key = `${weapon.id}:${location.id}`;
                return this.grid[key]?.state === 'circle';
            });

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

        // Rule 2: If only one empty cell in a row, it must be a circle
        this.suspects.forEach(suspect => {
            const emptyCells = this.weapons.filter(weapon => {
                const key = `${suspect.id}:${weapon.id}`;
                return this.grid[key]?.state === 'empty';
            });

            if (emptyCells.length === 1) {
                const key = `${suspect.id}:${emptyCells[0].id}`;
                this.grid[key] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        this.suspects.forEach(suspect => {
            const emptyCells = this.locations.filter(location => {
                const key = `${suspect.id}:${location.id}`;
                return this.grid[key]?.state === 'empty';
            });

            if (emptyCells.length === 1) {
                const key = `${suspect.id}:${emptyCells[0].id}`;
                this.grid[key] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        this.weapons.forEach(weapon => {
            const emptyCells = this.locations.filter(location => {
                const key = `${weapon.id}:${location.id}`;
                return this.grid[key]?.state === 'empty';
            });

            if (emptyCells.length === 1) {
                const key = `${weapon.id}:${emptyCells[0].id}`;
                this.grid[key] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        return changed;
    }

    // Get list of unsolved cells (cells that are still 'empty')
    getUnsolvedCells(): Array<{ type: string; id1: string; id2: string }> {
        const unsolved: Array<{ type: string; id1: string; id2: string }> = [];

        // Check Suspect-Weapon grid
        this.suspects.forEach(suspect => {
            this.weapons.forEach(weapon => {
                const key = `${suspect.id}:${weapon.id}`;
                if (!this.grid[key] || this.grid[key].state === 'empty') {
                    unsolved.push({ type: 'suspect-weapon', id1: suspect.id, id2: weapon.id });
                }
            });
        });

        // Check Suspect-Location grid
        this.suspects.forEach(suspect => {
            this.locations.forEach(location => {
                const key = `${suspect.id}:${location.id}`;
                if (!this.grid[key] || this.grid[key].state === 'empty') {
                    unsolved.push({ type: 'suspect-location', id1: suspect.id, id2: location.id });
                }
            });
        });

        // Check Weapon-Location grid
        this.weapons.forEach(weapon => {
            this.locations.forEach(location => {
                const key = `${weapon.id}:${location.id}`;
                if (!this.grid[key] || this.grid[key].state === 'empty') {
                    unsolved.push({ type: 'weapon-location', id1: weapon.id, id2: location.id });
                }
            });
        });

        return unsolved;
    }

    // Check if puzzle is completely solved
    isSolved(): boolean {
        this.applyHints();
        const unsolved = this.getUnsolvedCells();
        return unsolved.length === 0;
    }

    // Check if puzzle has a unique solution
    hasUniqueSolution(): boolean {
        // Check that each suspect has exactly one weapon and one location
        for (const suspect of this.suspects) {
            const weapons = this.weapons.filter(weapon => {
                const key = `${suspect.id}:${weapon.id}`;
                return this.grid[key]?.state === 'circle';
            });

            const locations = this.locations.filter(location => {
                const key = `${suspect.id}:${location.id}`;
                return this.grid[key]?.state === 'circle';
            });

            if (weapons.length !== 1 || locations.length !== 1) {
                return false;
            }
        }

        return true;
    }

    solve(): Solution | null {
        this.applyHints();
        if (!this.hasUniqueSolution()) return null;

        // Return the solution
        const solution: Solution = {};
        return solution;
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

    const random = mulberry32(seed);

    // Step 1: Create the solution first
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

    // The culprit is the first in each shuffled list
    const solution = {
        suspectId: shuffledSuspects[0].id,
        weaponId: shuffledWeapons[0].id,
        locationId: shuffledLocations[0].id,
    };

    console.log('[Hint Generator] Solution:', solution);

    // Step 2: Generate all possible hint candidates based on the solution
    function generatePossibleHints(): Array<{ text: string; type: string; priority: number }> {
        const candidates: Array<{ text: string; type: string; priority: number }> = [];

        // Type 1: Positive hints (high priority - directly reveal solution facts)
        suspects.forEach(suspect => {
            weapons.forEach(weapon => {
                const isCorrect = suspect.id === solution.suspectId && weapon.id === solution.weaponId;
                if (isCorrect) {
                    candidates.push({
                        text: `${suspect.name}は${weapon.name}を使った。`,
                        type: 'suspect-weapon-positive',
                        priority: 10
                    });
                }
            });
        });

        weapons.forEach(weapon => {
            locations.forEach(location => {
                const isCorrect = weapon.id === solution.weaponId && location.id === solution.locationId;
                if (isCorrect) {
                    candidates.push({
                        text: `${weapon.name}は${location.name}で発見された。`,
                        type: 'weapon-location-positive',
                        priority: 10
                    });
                }
            });
        });

        suspects.forEach(suspect => {
            locations.forEach(location => {
                const isCorrect = suspect.id === solution.suspectId && location.id === solution.locationId;
                if (isCorrect) {
                    candidates.push({
                        text: `${suspect.name}は${location.name}にいた。`,
                        type: 'suspect-location-positive',
                        priority: 10
                    });
                }
            });
        });

        // Type 2: Negative hints (medium priority - eliminate wrong combinations)
        suspects.forEach(suspect => {
            weapons.forEach(weapon => {
                const isWrong = suspect.id !== solution.suspectId || weapon.id !== solution.weaponId;
                if (isWrong) {
                    candidates.push({
                        text: `${suspect.name}は${weapon.name}を使っていない。`,
                        type: 'suspect-weapon-negative',
                        priority: 5
                    });
                }
            });
        });

        suspects.forEach(suspect => {
            locations.forEach(location => {
                const isWrong = suspect.id !== solution.suspectId || location.id !== solution.locationId;
                if (isWrong) {
                    candidates.push({
                        text: `${suspect.name}は${location.name}にいなかった。`,
                        type: 'suspect-location-negative',
                        priority: 5
                    });
                }
            });
        });

        weapons.forEach(weapon => {
            locations.forEach(location => {
                const isWrong = weapon.id !== solution.weaponId || location.id !== solution.locationId;
                if (isWrong) {
                    candidates.push({
                        text: `${weapon.name}は${location.name}では使われなかった。`,
                        type: 'weapon-location-negative',
                        priority: 5
                    });
                }
            });
        });

        // Shuffle candidates to add variety
        return shuffle(candidates);
    }

    // Step 3: Incremental hint generation - add hints until puzzle is solvable
    function generateMinimalHints(): Hint[] {
        const hints: Hint[] = [];
        const candidates = generatePossibleHints();
        let hintId = 1;
        const maxHints = suspects.length * 4; // Safety limit
        let iterations = 0;
        const maxIterations = 100;

        console.log('[Hint Generator] Starting incremental generation...');
        console.log('[Hint Generator] Total candidates:', candidates.length);

        while (iterations < maxIterations && hints.length < maxHints) {
            iterations++;

            // CRITICAL: Test solver WITHOUT solution data (solver must deduce from hints alone)
            const solver = new PuzzleSolver(suspects, weapons, locations, hints);

            if (solver.isSolved()) {
                console.log('[Hint Generator] Puzzle solved! Total hints:', hints.length);
                break;
            }

            // Get unsolved cells
            const unsolvedCells = solver.getUnsolvedCells();

            if (unsolvedCells.length === 0) {
                // Puzzle is filled but might not have unique solution
                console.log('[Hint Generator] Grid filled but checking uniqueness...');
                break;
            }

            // Find a hint that helps solve some unsolved cells
            let hintAdded = false;
            for (const candidate of candidates) {
                // Skip if hint already exists
                if (hints.some(h => h.text === candidate.text)) {
                    continue;
                }

                // Try adding this hint temporarily
                const testHints = [...hints, {
                    id: `h${hintId}`,
                    text: candidate.text,
                    isStrikethrough: false
                }];

                const testSolver = new PuzzleSolver(suspects, weapons, locations, testHints);
                const newUnsolvedCells = testSolver.getUnsolvedCells();

                // If this hint reduces unsolved cells, add it
                if (newUnsolvedCells.length < unsolvedCells.length) {
                    hints.push({
                        id: `h${hintId++}`,
                        text: candidate.text,
                        isStrikethrough: false
                    });
                    console.log(`[Hint Generator] Added hint ${hints.length}:`, candidate.text);
                    hintAdded = true;
                    break;
                }
            }

            if (!hintAdded) {
                console.warn('[Hint Generator] No helpful hint found, breaking loop');
                break;
            }
        }

        return hints;
    }

    // Step 4: Remove redundant hints (TEMPORARILY DISABLED for debugging)
    function removeRedundantHints(hints: Hint[]): Hint[] {
        console.log('[Hint Generator] Redundancy check DISABLED - returning all hints');
        // Disabled to prevent over-deletion during initial testing
        // Will re-enable after confirming hint generation works correctly
        return hints;

        /* ORIGINAL CODE - DISABLED
        console.log('[Hint Generator] Checking for redundant hints...');
        const necessaryHints: Hint[] = [];
        const minHints = suspects.length; // Safety: never go below grid size

        for (let i = 0; i < hints.length; i++) {
            // Skip if we're already at minimum
            if (necessaryHints.length >= minHints && hints.length - necessaryHints.length <= 1) {
                necessaryHints.push(hints[i]);
                continue;
            }

            // Create hint list without hint i
            const testHints = hints.filter((_, index) => index !== i);
            
            // Test if puzzle is still solvable without this hint
            const solver = new PuzzleSolver(suspects, weapons, locations, testHints);
            
            if (!solver.isSolved()) {
                // This hint is necessary
                necessaryHints.push(hints[i]);
            } else {
                console.log('[Hint Generator] Removed redundant hint:', hints[i].text);
            }
        }

        console.log(`[Hint Generator] Reduced from ${hints.length} to ${necessaryHints.length} hints`);
        return necessaryHints;
        */
    }

    // Generate hints
    let hints = generateMinimalHints();
    hints = removeRedundantHints(hints);

    // Step 5: Add identity clue (final clue)
    const identityClueType = random() > 0.5 ? 'weapon' : 'location';
    let identityClueText = '';

    if (identityClueType === 'weapon') {
        identityClueText = `犯人は${shuffledWeapons[0].name}を使用した痕跡がある。`;
    } else {
        identityClueText = `犯人は${shuffledLocations[0].name}にいた形跡がある。`;
    }

    // Reassign IDs sequentially
    hints = hints.map((hint, index) => ({
        ...hint,
        id: `h${index + 1}`
    }));

    hints.push({
        id: `h${hints.length + 1}`,
        text: `🚨 ${identityClueText}`,
        isStrikethrough: false,
        type: 'identity'
    });

    console.log('[Hint Generator] Final hint count:', hints.length);
    console.log('[Hint Generator] Hints:', hints.map(h => h.text));

    return { solution, hints };
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
