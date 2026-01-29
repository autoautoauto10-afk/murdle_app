import { PuzzleData, Entity, Hint } from '@/types/game';
import { SUSPECTS, WEAPONS, LOCATIONS } from '@/lib/data';

// Simple seedable random generator
function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function generateDailyPuzzle(date: string): PuzzleData {
    const seed = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    const random = mulberry32(seed);

    const shuffle = <T>(array: T[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const selectedSuspects = shuffle(SUSPECTS).slice(0, 3);
    const selectedWeapons = shuffle(WEAPONS).slice(0, 3);
    const selectedLocations = shuffle(LOCATIONS).slice(0, 3);

    // The solution is the first item in each shuffled list (conceptually)
    const solution = {
        suspectId: selectedSuspects[0].id,
        weaponId: selectedWeapons[0].id,
        locationId: selectedLocations[0].id,
    };

    // Generate some simple hints
    const hints: Hint[] = [
        { id: 'h1', text: `${selectedSuspects[0].name} brought the ${selectedWeapons[0].name}.`, isStrikethrough: false },
        { id: 'h2', text: `The ${selectedWeapons[0].name} was found in the ${selectedLocations[0].name}.`, isStrikethrough: false },
        { id: 'h3', text: `${selectedSuspects[1].name} was not in the ${selectedLocations[0].name}.`, isStrikethrough: false },
        { id: 'h4', text: `${selectedSuspects[2].name} did not have the ${selectedWeapons[1].name}.`, isStrikethrough: false },
        { id: 'h5', text: `Nobody used the ${selectedWeapons[2].name} in the ${selectedLocations[1].name}.`, isStrikethrough: false },
    ];

    return {
        date,
        suspects: selectedSuspects,
        weapons: selectedWeapons,
        locations: selectedLocations,
        solution,
        hints,
    };
}
