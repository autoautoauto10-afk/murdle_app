import { Entity } from '@/types/game';

export const SUSPECTS: Entity[] = [
    { id: 's1', name: 'Mayor Grey', category: 'suspect' },
    { id: 's2', name: 'Chef Red', category: 'suspect' },
    { id: 's3', name: 'Lady Blue', category: 'suspect' },
    { id: 's4', name: 'Professor Plum', category: 'suspect' },
];

export const WEAPONS: Entity[] = [
    { id: 'w1', name: 'Rusty Dagger', category: 'weapon' },
    { id: 'w2', name: 'Heavy Candlestick', category: 'weapon' },
    { id: 'w3', name: 'Poison Vial', category: 'weapon' },
    { id: 'w4', name: 'Lead Pipe', category: 'weapon' },
];

export const LOCATIONS: Entity[] = [
    { id: 'l1', name: 'Library', category: 'location' },
    { id: 'l2', name: 'Kitchen', category: 'location' },
    { id: 'l3', name: 'Conservatory', category: 'location' },
    { id: 'l4', name: 'Cellar', category: 'location' },
];
