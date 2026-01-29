import { PuzzleData } from '@/types/game';
import { SUSPECTS, WEAPONS, LOCATIONS } from '@/lib/data';
import { generateLogicPuzzle } from './logicGenerator';

export function generateDailyPuzzle(date: string): PuzzleData {
    const seed = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);

    // Use first 3 of each category for simplicity
    const selectedSuspects = SUSPECTS.slice(0, 3);
    const selectedWeapons = WEAPONS.slice(0, 3);
    const selectedLocations = LOCATIONS.slice(0, 3);

    // Generate puzzle with solver validation
    const { solution, hints } = generateLogicPuzzle(
        selectedSuspects,
        selectedWeapons,
        selectedLocations,
        seed
    );

    return {
        date,
        suspects: selectedSuspects,
        weapons: selectedWeapons,
        locations: selectedLocations,
        solution,
        hints,
    };
}
