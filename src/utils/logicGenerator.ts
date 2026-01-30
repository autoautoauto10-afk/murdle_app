import { PuzzleData, Entity, Hint, GridState } from '@/types/game';

interface Solution {
    [suspectId: string]: {
        weaponId: string;
        locationId: string;
    };
}

// ===== COMPONENT 1: SMART SOLVER =====
// Human-level solver with triangulation and exclusion logic
class SmartSolver {
    private suspects: Entity[];
    private weapons: Entity[];
    private locations: Entity[];
    private grid: GridState;

    constructor(suspects: Entity[], weapons: Entity[], locations: Entity[]) {
        this.suspects = suspects;
        this.weapons = weapons;
        this.locations = locations;
        this.grid = {};
        this.initializeGrid();
    }

    private initializeGrid(): void {
        // Initialize all cells as 'empty'
        this.suspects.forEach(suspect => {
            this.weapons.forEach(weapon => {
                this.grid[`${suspect.id}:${weapon.id}`] = { state: 'empty', isAutoFilled: false };
            });
            this.locations.forEach(location => {
                this.grid[`${suspect.id}:${location.id}`] = { state: 'empty', isAutoFilled: false };
            });
        });
        this.weapons.forEach(weapon => {
            this.locations.forEach(location => {
                this.grid[`${weapon.id}:${location.id}`] = { state: 'empty', isAutoFilled: false };
            });
        });
    }

    // Apply hint and return TRUE if grid changed, FALSE otherwise
    applyHint(hintText: string): boolean {
        const beforeState = this.getGridSnapshot();

        // Parse and apply hint
        this.parseAndApplyHint(hintText);

        // Apply deduction rules (triangulation + exclusion)
        let changed = true;
        let iterations = 0;
        while (changed && iterations < 20) {
            changed = this.applyDeductionRules();
            iterations++;
        }

        const afterState = this.getGridSnapshot();

        // Check if grid changed
        return beforeState !== afterState;
    }

    private getGridSnapshot(): string {
        const keys = Object.keys(this.grid).sort();
        return keys.map(key => `${key}:${this.grid[key].state}`).join('|');
    }

    private parseAndApplyHint(text: string): void {
        text = text.replace('🚨 ', '');

        // Positive patterns
        const swMatch = text.match(/(.+)は(.+)を使った/);
        if (swMatch) {
            const suspect = this.suspects.find(s => s.name === swMatch[1]);
            const weapon = this.weapons.find(w => w.name === swMatch[2]);
            if (suspect && weapon) {
                this.setCell(suspect.id, weapon.id, 'circle');
            }
        }

        const wlMatch = text.match(/(.+)は(.+)で発見された/);
        if (wlMatch) {
            const weapon = this.weapons.find(w => w.name === wlMatch[1]);
            const location = this.locations.find(l => l.name === wlMatch[2]);
            if (weapon && location) {
                this.setCell(weapon.id, location.id, 'circle');
            }
        }

        const slMatch = text.match(/(.+)は(.+)にいた/);
        if (slMatch) {
            const suspect = this.suspects.find(s => s.name === slMatch[1]);
            const location = this.locations.find(l => l.name === slMatch[2]);
            if (suspect && location) {
                this.setCell(suspect.id, location.id, 'circle');
            }
        }

        // Negative patterns
        const swNegMatch = text.match(/(.+)は(.+)を使っていない/);
        if (swNegMatch) {
            const suspect = this.suspects.find(s => s.name === swNegMatch[1]);
            const weapon = this.weapons.find(w => w.name === swNegMatch[2]);
            if (suspect && weapon) {
                this.setCell(suspect.id, weapon.id, 'cross');
            }
        }

        const slNegMatch = text.match(/(.+)は(.+)にいなかった/);
        if (slNegMatch) {
            const suspect = this.suspects.find(s => s.name === slNegMatch[1]);
            const location = this.locations.find(l => l.name === slNegMatch[2]);
            if (suspect && location) {
                this.setCell(suspect.id, location.id, 'cross');
            }
        }

        const wlNegMatch = text.match(/(.+)は(.+)では使われなかった/);
        if (wlNegMatch) {
            const weapon = this.weapons.find(w => w.name === wlNegMatch[1]);
            const location = this.locations.find(l => l.name === wlNegMatch[2]);
            if (weapon && location) {
                this.setCell(weapon.id, location.id, 'cross');
            }
        }
    }

    private setCell(id1: string, id2: string, state: 'circle' | 'cross'): void {
        const key = `${id1}:${id2}`;
        if (this.grid[key] && this.grid[key].state === 'empty') {
            this.grid[key] = { state, isAutoFilled: false };
        }
    }

    private applyDeductionRules(): boolean {
        let changed = false;

        // EXCLUSION: If circle in row, cross out others
        this.suspects.forEach(suspect => {
            const circleWeapon = this.weapons.find(w =>
                this.grid[`${suspect.id}:${w.id}`]?.state === 'circle'
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

            const circleLocation = this.locations.find(l =>
                this.grid[`${suspect.id}:${l.id}`]?.state === 'circle'
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
            const circleLocation = this.locations.find(l =>
                this.grid[`${weapon.id}:${l.id}`]?.state === 'circle'
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

        // If only one empty, it must be circle
        this.suspects.forEach(suspect => {
            const emptyWeapons = this.weapons.filter(w =>
                this.grid[`${suspect.id}:${w.id}`]?.state === 'empty'
            );
            if (emptyWeapons.length === 1) {
                this.grid[`${suspect.id}:${emptyWeapons[0].id}`] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }

            const emptyLocations = this.locations.filter(l =>
                this.grid[`${suspect.id}:${l.id}`]?.state === 'empty'
            );
            if (emptyLocations.length === 1) {
                this.grid[`${suspect.id}:${emptyLocations[0].id}`] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        this.weapons.forEach(weapon => {
            const emptyLocations = this.locations.filter(l =>
                this.grid[`${weapon.id}:${l.id}`]?.state === 'empty'
            );
            if (emptyLocations.length === 1) {
                this.grid[`${weapon.id}:${emptyLocations[0].id}`] = { state: 'circle', isAutoFilled: true };
                changed = true;
            }
        });

        // TRIANGULATION: A=B, B=C => A=C
        this.suspects.forEach(suspect => {
            const weapon = this.weapons.find(w =>
                this.grid[`${suspect.id}:${w.id}`]?.state === 'circle'
            );
            const location = this.locations.find(l =>
                this.grid[`${suspect.id}:${l.id}`]?.state === 'circle'
            );

            if (weapon && location) {
                const key = `${weapon.id}:${location.id}`;
                if (this.grid[key]?.state === 'empty') {
                    this.grid[key] = { state: 'circle', isAutoFilled: true };
                    changed = true;
                }
            }

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

    isSolved(): boolean {
        // Check if all cells are filled
        for (const key in this.grid) {
            if (this.grid[key].state === 'empty') {
                return false;
            }
        }
        return true;
    }

    getGridState(): GridState {
        return { ...this.grid };
    }

    clone(): SmartSolver {
        const cloned = new SmartSolver(this.suspects, this.weapons, this.locations);
        cloned.grid = JSON.parse(JSON.stringify(this.grid));
        return cloned;
    }
}

// Seedable random
function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function generateLogicPuzzle(
    suspects: Entity[],
    weapons: Entity[],
    locations: Entity[],
    seed: number
): { solution: { suspectId: string; weaponId: string; locationId: string }; hints: Hint[] } {

    console.log('=== STATE-CHANGE DETECTION: PUZZLE GENERATION ===');

    const random = mulberry32(seed);

    const shuffle = <T>(array: T[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // ===== COMPONENT 2: FULL SCENARIO =====
    console.log('[Scenario] Building complete scenario...');

    const shuffledSuspects = shuffle(suspects);
    const shuffledWeapons = shuffle(weapons);
    const shuffledLocations = shuffle(locations);

    const fullScenario: Array<{ suspect: Entity; weapon: Entity; location: Entity }> = [];

    for (let i = 0; i < suspects.length; i++) {
        fullScenario.push({
            suspect: shuffledSuspects[i],
            weapon: shuffledWeapons[i],
            location: shuffledLocations[i]
        });
    }

    const solution = {
        suspectId: shuffledSuspects[0].id,
        weaponId: shuffledWeapons[0].id,
        locationId: shuffledLocations[0].id,
    };

    console.log('[Scenario] Full scenario:');
    fullScenario.forEach((s, idx) => {
        const marker = idx === 0 ? '👉' : '  ';
        console.log(`${marker} ${s.suspect.name} + ${s.weapon.name} @ ${s.location.name}`);
    });

    // Build complete hint pool
    const hintPool: string[] = [];

    // Positive hints from full scenario
    fullScenario.forEach(s => {
        hintPool.push(`${s.suspect.name}は${s.weapon.name}を使った。`);
        hintPool.push(`${s.weapon.name}は${s.location.name}で発見された。`);
        hintPool.push(`${s.suspect.name}は${s.location.name}にいた。`);
    });

    // Negative hints (only contradictions with scenario)
    suspects.forEach(suspect => {
        weapons.forEach(weapon => {
            const isWrong = !fullScenario.some(s =>
                s.suspect.id === suspect.id && s.weapon.id === weapon.id
            );
            if (isWrong) {
                hintPool.push(`${suspect.name}は${weapon.name}を使っていない。`);
            }
        });

        locations.forEach(location => {
            const isWrong = !fullScenario.some(s =>
                s.suspect.id === suspect.id && s.location.id === location.id
            );
            if (isWrong) {
                hintPool.push(`${suspect.name}は${location.name}にいなかった。`);
            }
        });
    });

    weapons.forEach(weapon => {
        locations.forEach(location => {
            const isWrong = !fullScenario.some(s =>
                s.weapon.id === weapon.id && s.location.id === location.id
            );
            if (isWrong) {
                hintPool.push(`${weapon.name}は${location.name}では使われなかった。`);
            }
        });
    });

    const shuffledPool = shuffle(hintPool);
    console.log(`[Hint Pool] Generated ${shuffledPool.length} total hint candidates`);

    // ===== COMPONENT 3: ACCUMULATION PHASE =====
    console.log('[Accumulation] Selecting hints based on state changes...');

    const solver = new SmartSolver(suspects, weapons, locations);
    const selectedHints: Hint[] = [];
    let hintId = 1;
    let acceptedCount = 0;
    let rejectedCount = 0;

    for (const hintText of shuffledPool) {
        const beforeSolved = solver.isSolved();

        if (beforeSolved) {
            console.log('[Accumulation] ✅ Puzzle already solved, stopping');
            break;
        }

        // Create temporary clone to test
        const testSolver = solver.clone();
        const changed = testSolver.applyHint(hintText);

        if (changed) {
            // Grid changed - this hint provides NEW information
            acceptedCount++;
            selectedHints.push({
                id: `h${hintId++}`,
                text: hintText,
                isStrikethrough: false
            });

            // Apply to main solver
            solver.applyHint(hintText);

            console.log(`[Accumulation] ✓ [${selectedHints.length}] "${hintText}" (grid changed)`);
        } else {
            // Grid didn't change - redundant information
            rejectedCount++;
            console.log(`[Accumulation] ✗ "${hintText}" (no change)`);
        }
    }

    console.log(`[Accumulation] Accepted: ${acceptedCount}, Rejected: ${rejectedCount}`);
    console.log(`[Accumulation] Puzzle solved: ${solver.isSolved()}`);

    // Add identity clue
    const culpritSuspect = suspects.find(s => s.id === solution.suspectId)!;
    const culpritWeapon = weapons.find(w => w.id === solution.weaponId)!;
    const culpritLocation = locations.find(l => l.id === solution.locationId)!;

    const identityClueType = random() > 0.5 ? 'weapon' : 'location';
    const identityClueText = identityClueType === 'weapon'
        ? `犯人は${culpritWeapon.name}を使用した痕跡がある。`
        : `犯人は${culpritLocation.name}にいた形跡がある。`;

    selectedHints.push({
        id: `h${selectedHints.length + 1}`,
        text: `🚨 ${identityClueText}`,
        isStrikethrough: false,
        type: 'identity'
    });

    // ===== COMPONENT 4: BACKWARD PRUNING =====
    console.log('[Pruning] Removing redundant hints via backward pruning...');

    const identityClue = selectedHints.find(h => h.text.startsWith('🚨'));
    const hintsWithoutIdentity = selectedHints.filter(h => !h.text.startsWith('🚨'));

    const essential: Hint[] = [];
    let pruned = 0;

    for (let i = 0; i < hintsWithoutIdentity.length; i++) {
        const testHints = hintsWithoutIdentity.filter((_, idx) => idx !== i);

        const testSolver = new SmartSolver(suspects, weapons, locations);
        testHints.forEach(h => testSolver.applyHint(h.text));

        if (!testSolver.isSolved()) {
            // Without this hint, puzzle is NOT solved - it's ESSENTIAL
            essential.push(hintsWithoutIdentity[i]);
            console.log(`[Pruning] ✓ Essential: "${hintsWithoutIdentity[i].text}"`);
        } else {
            // Still solved without it - REDUNDANT
            pruned++;
            console.log(`[Pruning] ✗ Pruned: "${hintsWithoutIdentity[i].text}"`);
        }
    }

    // Final shuffle and add identity clue
    const finalHints = shuffle(essential);
    if (identityClue) {
        finalHints.push(identityClue);
    }

    console.log('=== GENERATION COMPLETE ===');
    console.log(`Final hints: ${finalHints.length} (pruned ${pruned})`);

    return { solution, hints: finalHints };
}
