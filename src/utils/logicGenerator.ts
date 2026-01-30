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

    // Check if ALL cells are filled (NO cheating with solution!)
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

// DOMINATION CHECK: Remove negative hints implied by positive hints
function filterImpliedNegatives(
    hints: Hint[],
    suspects: Entity[],
    weapons: Entity[],
    locations: Entity[]
): Hint[] {
    console.log('[Domination] Filtering implied negative hints...');
    console.log(`[Domination] Initial hint count: ${hints.length}`);

    // Extract all positive hints and parse them
    const positiveInfo: Array<{
        suspectId?: string;
        weaponId?: string;
        locationId?: string;
        type: 'suspect-weapon' | 'weapon-location' | 'suspect-location';
    }> = [];

    hints.forEach(hint => {
        const text = hint.text.replace('🚨 ', '');

        // "AはBを使った" (suspect-weapon)
        const swMatch = text.match(/(.+)は(.+)を使った/);
        if (swMatch) {
            const suspect = suspects.find(s => s.name === swMatch[1]);
            const weapon = weapons.find(w => w.name === swMatch[2]);
            if (suspect && weapon) {
                positiveInfo.push({
                    suspectId: suspect.id,
                    weaponId: weapon.id,
                    type: 'suspect-weapon'
                });
            }
        }

        // "AはBで発見された" (weapon-location)
        const wlMatch = text.match(/(.+)は(.+)で発見された/);
        if (wlMatch) {
            const weapon = weapons.find(w => w.name === wlMatch[1]);
            const location = locations.find(l => l.name === wlMatch[2]);
            if (weapon && location) {
                positiveInfo.push({
                    weaponId: weapon.id,
                    locationId: location.id,
                    type: 'weapon-location'
                });
            }
        }

        // "AはBにいた" (suspect-location)
        const slMatch = text.match(/(.+)は(.+)にいた/);
        if (slMatch) {
            const suspect = suspects.find(s => s.name === slMatch[1]);
            const location = locations.find(l => l.name === slMatch[2]);
            if (suspect && location) {
                positiveInfo.push({
                    suspectId: suspect.id,
                    locationId: location.id,
                    type: 'suspect-location'
                });
            }
        }
    });

    console.log(`[Domination] Found ${positiveInfo.length} positive facts`);

    // Filter out negative hints that are implied
    let removedCount = 0;
    const filteredHints = hints.filter(hint => {
        const text = hint.text.replace('🚨 ', '');

        // Check negative patterns
        // "AはBを使っていない" (suspect-weapon negative)
        const swNegMatch = text.match(/(.+)は(.+)を使っていない/);
        if (swNegMatch) {
            const suspect = suspects.find(s => s.name === swNegMatch[1]);
            const weapon = weapons.find(w => w.name === swNegMatch[2]);
            if (suspect && weapon) {
                // Check if we know suspect's actual weapon
                const impliedByPositive = positiveInfo.some(info =>
                    info.type === 'suspect-weapon' &&
                    info.suspectId === suspect.id &&
                    info.weaponId !== weapon.id
                );
                if (impliedByPositive) {
                    removedCount++;
                    console.log(`[Domination] ✗ Removed: "${text}" (implied by positive)`);
                    return false;
                }
            }
        }

        // "AはBにいなかった" (suspect-location negative)
        const slNegMatch = text.match(/(.+)は(.+)にいなかった/);
        if (slNegMatch) {
            const suspect = suspects.find(s => s.name === slNegMatch[1]);
            const location = locations.find(l => l.name === slNegMatch[2]);
            if (suspect && location) {
                const impliedByPositive = positiveInfo.some(info =>
                    info.type === 'suspect-location' &&
                    info.suspectId === suspect.id &&
                    info.locationId !== location.id
                );
                if (impliedByPositive) {
                    removedCount++;
                    console.log(`[Domination] ✗ Removed: "${text}" (implied by positive)`);
                    return false;
                }
            }
        }

        // "AはBでは使われなかった" (weapon-location negative)
        const wlNegMatch = text.match(/(.+)は(.+)では使われなかった/);
        if (wlNegMatch) {
            const weapon = weapons.find(w => w.name === wlNegMatch[1]);
            const location = locations.find(l => l.name === wlNegMatch[2]);
            if (weapon && location) {
                const impliedByPositive = positiveInfo.some(info =>
                    info.type === 'weapon-location' &&
                    info.weaponId === weapon.id &&
                    info.locationId !== location.id
                );
                if (impliedByPositive) {
                    removedCount++;
                    console.log(`[Domination] ✗ Removed: "${text}" (implied by positive)`);
                    return false;
                }
            }
        }

        return true;
    });

    console.log(`[Domination] Removed ${removedCount} implied negative hints`);
    console.log(`[Domination] Remaining hints: ${filteredHints.length}`);

    return filteredHints;
}

// PHASE 2: Remove redundant hints
function removeRedundantHints(
    hints: Hint[],
    suspects: Entity[],
    weapons: Entity[],
    locations: Entity[]
): Hint[] {
    console.log('[Pruning] Starting redundancy removal...');
    console.log(`[Pruning] Initial hint count: ${hints.length}`);

    const essential: Hint[] = [];
    let removedCount = 0;

    for (let i = 0; i < hints.length; i++) {
        const currentHint = hints[i];

        // IMPORTANT: Protect identity clue (starts with 🚨)
        if (currentHint.text.startsWith('🚨')) {
            essential.push(currentHint);
            console.log(`[Pruning] Protected identity clue: "${currentHint.text}"`);
            continue;
        }

        // Test: remove this hint and see if still solvable
        const testHints = hints.filter((_, index) => index !== i);
        const solver = new PuzzleSolver(suspects, weapons, locations, testHints);
        solver.solve();

        if (!solver.isSolved()) {
            // Without this hint, puzzle is NOT solvable → ESSENTIAL
            essential.push(currentHint);
            console.log(`[Pruning] ✓ Essential: "${currentHint.text}"`);
        } else {
            // Without this hint, puzzle is STILL solvable → REDUNDANT
            removedCount++;
            console.log(`[Pruning] ✗ Redundant: "${currentHint.text}"`);
        }
    }

    console.log(`[Pruning] Removed ${removedCount} redundant hints`);
    console.log(`[Pruning] Final essential hint count: ${essential.length}`);

    return essential;
}

export function generateLogicPuzzle(
    suspects: Entity[],
    weapons: Entity[],
    locations: Entity[],
    seed: number
): { solution: { suspectId: string; weaponId: string; locationId: string }; hints: Hint[] } {

    console.log('=== SIMPLE 2-PHASE PUZZLE GENERATION ===');

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

    // ===== STEP 1: BUILD FULL SCENARIO (all suspects with weapons & locations) =====
    console.log('[Scenario] Building complete scenario for all suspects...');

    // Create 1-to-1 mapping for all suspects
    const fullScenario: Array<{ suspect: Entity, weapon: Entity, location: Entity }> = [];

    for (let i = 0; i < shuffledSuspects.length; i++) {
        fullScenario.push({
            suspect: shuffledSuspects[i],
            weapon: shuffledWeapons[i],
            location: shuffledLocations[i]
        });
    }

    console.log('[Scenario] Full scenario:');
    fullScenario.forEach(s => {
        const isCulprit = s.suspect.id === solution.suspectId;
        console.log(`  ${isCulprit ? '👉' : '  '} ${s.suspect.name} + ${s.weapon.name} @ ${s.location.name}`);
    });

    // ===== PHASE 1: GENERATION WITH POSITIVE HINT PRIORITY =====
    console.log('[Phase 1] Generating hints with positive hint priority...');

    // Build POSITIVE hint pool (from full scenario)
    const positiveHints: string[] = [];

    fullScenario.forEach(s => {
        positiveHints.push(`${s.suspect.name}は${s.weapon.name}を使った。`);
        positiveHints.push(`${s.weapon.name}は${s.location.name}で発見された。`);
        positiveHints.push(`${s.suspect.name}は${s.location.name}にいた。`);
    });

    console.log(`[Phase 1] Generated ${positiveHints.length} positive hint candidates`);

    // Build NEGATIVE hint pool
    const negativeHints: string[] = [];

    suspects.forEach(suspect => {
        weapons.forEach(weapon => {
            // Check if this is a wrong combination in the full scenario
            const isWrong = !fullScenario.some(s =>
                s.suspect.id === suspect.id && s.weapon.id === weapon.id
            );
            if (isWrong) {
                negativeHints.push(`${suspect.name}は${weapon.name}を使っていない。`);
            }
        });
    });

    suspects.forEach(suspect => {
        locations.forEach(location => {
            const isWrong = !fullScenario.some(s =>
                s.suspect.id === suspect.id && s.location.id === location.id
            );
            if (isWrong) {
                negativeHints.push(`${suspect.name}は${location.name}にいなかった。`);
            }
        });
    });

    weapons.forEach(weapon => {
        locations.forEach(location => {
            const isWrong = !fullScenario.some(s =>
                s.weapon.id === weapon.id && s.location.id === location.id
            );
            if (isWrong) {
                negativeHints.push(`${weapon.name}は${location.name}では使われなかった。`);
            }
        });
    });

    console.log(`[Phase 1] Generated ${negativeHints.length} negative hint candidates`);

    // Shuffle both pools
    const shuffledPositive = shuffle(positiveHints);
    const shuffledNegative = shuffle(negativeHints);

    // PRIORITY: Start with 2-3 positive hints
    const generatedHints: Hint[] = [];
    let hintId = 1;
    const initialPositiveCount = suspects.length === 3 ? 2 : 3;

    console.log(`[Phase 1] Adding ${initialPositiveCount} positive hints first (priority)...`);

    for (let i = 0; i < initialPositiveCount && i < shuffledPositive.length; i++) {
        generatedHints.push({
            id: `h${hintId++}`,
            text: shuffledPositive[i],
            isStrikethrough: false
        });
        console.log(`  [${generatedHints.length}] ✓ ${shuffledPositive[i]}`);
    }

    // Remove used positive hints from pool
    const remainingPositive = shuffledPositive.slice(initialPositiveCount);

    // Merge remaining hints and shuffle
    const remainingHints = shuffle([...remainingPositive, ...shuffledNegative]);
    console.log(`[Phase 1] Remaining hint pool: ${remainingHints.length} hints`);

    // Add hints until solvable
    console.log(`[Phase 1] Adding hints until puzzle is solvable...`);

    for (const hintText of remainingHints) {
        generatedHints.push({
            id: `h${hintId++}`,
            text: hintText,
            isStrikethrough: false
        });

        // Test if solved
        const solver = new PuzzleSolver(suspects, weapons, locations, generatedHints);
        solver.solve();

        if (solver.isSolved()) {
            console.log(`[Phase 1] ✅ Puzzle solved with ${generatedHints.length} hints`);
            break;
        }

        // Safety check
        if (generatedHints.length >= remainingHints.length + initialPositiveCount) {
            console.warn('[Phase 1] ⚠️ Used all hints but puzzle not solved!');
            break;
        }
    }

    // Add identity clue
    const identityClueType = random() > 0.5 ? 'weapon' : 'location';
    let identityClueText = '';

    if (identityClueType === 'weapon') {
        identityClueText = `犯人は${culpritWeapon.name}を使用した痕跡がある。`;
    } else {
        identityClueText = `犯人は${culpritLocation.name}にいた形跡がある。`;
    }

    generatedHints.push({
        id: `h${generatedHints.length + 1}`,
        text: `🚨 ${identityClueText}`,
        isStrikethrough: false,
        type: 'identity'
    });

    console.log(`[Phase 1] Total hints (with identity): ${generatedHints.length}`);

    // ===== PHASE 2: BACKWARD PRUNING (remove redundancy) =====
    console.log('[Phase 2] Removing redundant hints...');

    const minimalHints = removeRedundantHints(
        generatedHints,
        suspects,
        weapons,
        locations
    );

    console.log('=== GENERATION COMPLETE ===');
    console.log(`Final hint count: ${minimalHints.length}`);
    console.log(`Removed ${generatedHints.length - minimalHints.length} redundant hints`);

    return { solution, hints: minimalHints };
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
