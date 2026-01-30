import { PuzzleData } from '@/types/game';
import { SUSPECTS, WEAPONS, LOCATIONS } from '@/lib/data';
import { generateLogicPuzzle } from './logicGenerator';

// String hash function: converts any string to a unique 32-bit integer
function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

export function generateDailyPuzzle(seed: string): PuzzleData {
    // Convert string seed to numeric seed
    let seedNumber: number;

    // Try to parse as date first (for backward compatibility with date strings)
    const dateTimestamp = new Date(seed).getTime();
    if (!isNaN(dateTimestamp)) {
        seedNumber = dateTimestamp;
    } else {
        // For non-date strings (like "random-..."), use string hash
        seedNumber = stringToHash(seed);
    }

    console.log('[Puzzle Generator] Seed String:', seed, '-> Numeric Seed:', seedNumber);

    // Use first 3 of each category for simplicity
    const selectedSuspects = SUSPECTS.slice(0, 3);
    const selectedWeapons = WEAPONS.slice(0, 3);
    const selectedLocations = LOCATIONS.slice(0, 3);

    // Generate puzzle with solver validation
    const { solution, hints } = generateLogicPuzzle(
        selectedSuspects,
        selectedWeapons,
        selectedLocations,
        seedNumber
    );

    return {
        date: seed,
        suspects: selectedSuspects,
        weapons: selectedWeapons,
        locations: selectedLocations,
        solution,
        hints,
    };
}
