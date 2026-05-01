export type Language = 'es' | 'en';

export type Screen = 'language' | 'home' | 'preview' | 'game' | 'free-modes-select' | 'free-mode-setup' | 'free-mode-board' | 'free-mode-result';

export type FreeModeType = 'challenge' | 'free-nexus' | 'free-pure';

export interface SavedWork {
  id: string;
  title: string;
  mode: FreeModeType;
  timestamp: number;
  freeRows: FreeModeRowData[];
  characterColors: Record<string, string>;
  freePhrase: string;
}

export interface BaseCharacter {
  id: number;
  letter: string;
}

export interface SetupCharacter extends BaseCharacter {
  type: 'fixed' | 'draggable';
}

export interface CharacterState extends SetupCharacter {
  slotIndex: number | null; // null if it's currently unassigned/in pool, or number if assigned to a row slot
}

export interface AcrosticRowData {
  index: number;
  baseLetter: string;
  charSlot: CharacterState | null; // The character currently in this drop slot
  inputText: string;
}

export interface FreeModeWordToken {
  id: number;
  text: string;
  color: string;
  slotIndex: number | null;
  isPrefilled?: boolean;
}

export interface FreeModeRowData {
  index: number;
  baseLetter: string;
  leftToken: FreeModeWordToken | null;
  mainInput: string;
  prePunctuation: string;
  postPunctuation: string;
  nexo: string;
  isVocalStandalone?: boolean; // New: click + Enter logic
  isPrefilled?: boolean; // New: Challenge pre-filled block
}

export interface AIComment {
  id: string;
  text: string;
  timestamp: number;
}

export interface ThematicWord {
  id: number;
  word: string;
  usedInRow: number | null;
}

export interface GameState {
  lang: Language;
  screen: Screen;
  gameMode: FreeModeType;
  firstTimeChallenge: boolean;
  suggestionsActive: boolean;
  dailyWord: string;
  theme: string;
  rows: AcrosticRowData[];
  draggablePool: CharacterState[]; 
  comments: AIComment[];
  freePhrase: string;
  freeRows: FreeModeRowData[];
  freeWordTokens: FreeModeWordToken[];
  characterColors: Record<string, string>; // Mapping of name to color
  suggestedNames: { male: string; female: string }; // Random male/female suggestions
  verticalTitle: string;
  readOnlyMode: boolean;
  thematicWords: ThematicWord[];
}
