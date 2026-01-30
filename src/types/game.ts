export type CategoryType = 'suspect' | 'weapon' | 'location';

export type Entity = {
  id: string;
  name: string;
  category: CategoryType;
  icon?: string;
};

export type CellState = 'empty' | 'cross' | 'circle';

export type CellMark = {
  state: CellState;
  isAutoFilled: boolean; // true if this mark was automatically placed by the system
};

export type GridState = {
  [key: string]: CellMark; // key format: "id1:id2"
};

// Three separate grids for the complete logic puzzle
export type MultiGridState = {
  suspectWeapon: GridState;    // 容疑者 × 凶器
  suspectLocation: GridState;  // 容疑者 × 場所
  weaponLocation: GridState;   // 凶器 × 場所
};

export type Hint = {
  id: string;
  text: string;
  isStrikethrough: boolean;
  type?: 'normal' | 'identity';
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
  identityClue: string;
  finalClue?: string; // Add this for compatibility check
  hints: Hint[];
};
