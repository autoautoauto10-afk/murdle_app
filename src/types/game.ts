export type CategoryType = 'suspect' | 'weapon' | 'location';

export type Entity = {
  id: string;
  name: string;
  category: CategoryType;
  icon?: string;
};

export type CellState = 'empty' | 'cross' | 'circle';

export type GridState = {
  [key: string]: CellState; // key format: "category1Id-id1:category2Id-id2"
};

export type Hint = {
  id: string;
  text: string;
  isStrikethrough: boolean;
};

export type PuzzleData = {
  date: string;
  suspects: Entity[];
  weapons: Entity[];
  locations: Entity[];
  solution: {
    suspectId: string;
    weaponId: string;
    locationId: string;
  };
  hints: Hint[];
};
