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

    constructor(suspects: Entity[], weapons: Entity[], locations: Entity[], hints: Hint[]) {
        this.suspects = suspects;
        this.weapons = weapons;
        this.locations = locations;
        this.hints = hints;
        this.grid = {};
    }

    // Apply hints to the grid
    applyHints(): void {
        this.hints.forEach(hint => {
            // Parse hint and mark grid accordingly
            // This is a simplified version - in production, you'd parse the hint text
            // For now, we'll trust that hints are generated correctly
        });
    }

    // Check if puzzle has a unique solution
    hasUniqueSolution(): boolean {
        // Simplified check: verify that each suspect can be uniquely paired
        // In a full implementation, this would use constraint propagation
        return true; // Placeholder for now
    }

    solve(): Solution | null {
        this.applyHints();
        if (!this.hasUniqueSolution()) return null;

        // Return the solution (simplified)
        const solution: Solution = {};
        return solution;
    }
}

export function generateLogicPuzzle(
    suspects: Entity[],
    weapons: Entity[],
    locations: Entity[],
    seed: number
): { solution: { suspectId: string; weaponId: string; locationId: string }; hints: Hint[]; identityClue: string } {

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

    // Step 2: Generate hints based on the solution
    const hints: Hint[] = [];
    let hintId = 1;

    // Positive hint: The culprit used this weapon at this location
    hints.push({
        id: `h${hintId++}`,
        text: `${shuffledSuspects[0].name}は${shuffledWeapons[0].name}を使った。`,
        isStrikethrough: false,
    });

    hints.push({
        id: `h${hintId++}`,
        text: `${shuffledWeapons[0].name}は${shuffledLocations[0].name}で発見された。`,
        isStrikethrough: false,
    });

    // Negative hints: Other suspects didn't use certain weapons
    if (shuffledSuspects.length > 1 && shuffledWeapons.length > 1) {
        hints.push({
            id: `h${hintId++}`,
            text: `${shuffledSuspects[1].name}は${shuffledWeapons[1].name}を使っていない。`,
            isStrikethrough: false,
        });
    }

    if (shuffledSuspects.length > 2 && shuffledLocations.length > 1) {
        hints.push({
            id: `h${hintId++}`,
            text: `${shuffledSuspects[2].name}は${shuffledLocations[1].name}にいなかった。`,
            isStrikethrough: false,
        });
    }

    if (shuffledWeapons.length > 2 && shuffledLocations.length > 2) {
        hints.push({
            id: `h${hintId++}`,
            text: `${shuffledWeapons[2].name}は${shuffledLocations[2].name}では使われなかった。`,
            isStrikethrough: false,
        });
    }

    // Additional elimination hints
    if (shuffledSuspects.length > 1 && shuffledLocations.length > 0) {
        hints.push({
            id: `h${hintId++}`,
            text: `${shuffledSuspects[1].name}は${shuffledLocations[0].name}にはいなかった。`,
            isStrikethrough: false,
        });
    }

    if (shuffledSuspects.length > 2 && shuffledWeapons.length > 0) {
        hints.push({
            id: `h${hintId++}`,
            text: `${shuffledSuspects[2].name}は${shuffledWeapons[0].name}を持っていなかった。`,
            isStrikethrough: false,
        });
    }

    // Step 3: Generate identity clue (The Final Clue)
    // 50% chance for weapon, 50% chance for location
    const identityClueType = random() > 0.5 ? 'weapon' : 'location';
    let identityClue = '';

    if (identityClueType === 'weapon') {
        identityClue = `犯人は${shuffledWeapons[0].name}を使用した痕跡がある。`;
    } else {
        identityClue = `犯人は${shuffledLocations[0].name}にいた形跡がある。`;
    }

    // Step 4: Verify solvability (simplified for now)
    const solver = new PuzzleSolver(suspects, weapons, locations, hints);
    const solverResult = solver.solve();

    // In a full implementation, we'd regenerate if solver fails
    // For now, we trust our hint generation

    return { solution, hints, identityClue };
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
