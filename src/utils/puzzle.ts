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

    // Seeded shuffle function using Fisher-Yates algorithm
    function seededShuffle<T>(array: T[], seed: number): T[] {
        const shuffled = [...array];
        let currentSeed = seed;

        // Simple LCG (Linear Congruential Generator) for deterministic randomness
        const random = () => {
            currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
            return currentSeed / 0x7fffffff;
        };

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    // Randomly select 4 items from each pool (from 10 total)
    const selectedSuspects = seededShuffle(SUSPECTS, seedNumber).slice(0, 4);
    const selectedWeapons = seededShuffle(WEAPONS, seedNumber + 1000).slice(0, 4);
    const selectedLocations = seededShuffle(LOCATIONS, seedNumber + 2000).slice(0, 4);

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
