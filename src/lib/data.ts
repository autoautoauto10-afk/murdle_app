import { Entity } from '@/types/game';

export const SUSPECTS: Entity[] = [
    { id: 's1', name: '赤井', category: 'suspect' },
    { id: 's2', name: '青木', category: 'suspect' },
    { id: 's3', name: '黄瀬', category: 'suspect' },
    { id: 's4', name: '緑川', category: 'suspect' },
    { id: 's5', name: '白鳥', category: 'suspect' },
    { id: 's6', name: '黒田', category: 'suspect' },
    { id: 's7', name: '茶谷', category: 'suspect' },
    { id: 's8', name: '桃井', category: 'suspect' },
    { id: 's9', name: '紫藤', category: 'suspect' },
    { id: 's10', name: '灰原', category: 'suspect' },
];

export const WEAPONS: Entity[] = [
    { id: 'w1', name: 'ナイフ', category: 'weapon' },
    { id: 'w2', name: 'ロープ', category: 'weapon' },
    { id: 'w3', name: '毒薬', category: 'weapon' },
    { id: 'w4', name: 'ハンマー', category: 'weapon' },
    { id: 'w5', name: 'バット', category: 'weapon' },
    { id: 'w6', name: '花瓶', category: 'weapon' },
    { id: 'w7', name: 'レンガ', category: 'weapon' },
    { id: 'w8', name: 'スコップ', category: 'weapon' },
    { id: 'w9', name: '鉄パイプ', category: 'weapon' },
    { id: 'w10', name: 'アイスピック', category: 'weapon' },
];

export const LOCATIONS: Entity[] = [
    { id: 'l1', name: '学校', category: 'location' },
    { id: 'l2', name: '公園', category: 'location' },
    { id: 'l3', name: '病院', category: 'location' },
    { id: 'l4', name: '図書館', category: 'location' },
    { id: 'l5', name: 'カフェ', category: 'location' },
    { id: 'l6', name: '映画館', category: 'location' },
    { id: 'l7', name: '体育館', category: 'location' },
    { id: 'l8', name: '屋上', category: 'location' },
    { id: 'l9', name: 'コンビニ', category: 'location' },
    { id: 'l10', name: '倉庫', category: 'location' },
];
