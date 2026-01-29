import { Entity } from '@/types/game';

export const SUSPECTS: Entity[] = [
    { id: 's1', name: '赤井', category: 'suspect' },
    { id: 's2', name: '青木', category: 'suspect' },
    { id: 's3', name: '黄瀬', category: 'suspect' },
    { id: 's4', name: '緑川', category: 'suspect' },
];

export const WEAPONS: Entity[] = [
    { id: 'w1', name: 'ナイフ', category: 'weapon' },
    { id: 'w2', name: '毒薬', category: 'weapon' },
    { id: 'w3', name: 'ロープ', category: 'weapon' },
    { id: 'w4', name: '重い置物', category: 'weapon' },
];

export const LOCATIONS: Entity[] = [
    { id: 'l1', name: '図書館', category: 'location' },
    { id: 'l2', name: 'キッチン', category: 'location' },
    { id: 'l3', name: '書斎', category: 'location' },
    { id: 'l4', name: '庭園', category: 'location' },
];
