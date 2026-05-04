import React, { createContext, useReducer, ReactNode } from 'react';
import type { GameState, Language, Screen, AIComment, FreeModeType, FreeModeWordToken, FreeModeRowData } from '../types';

type Action =
  | { type: 'SET_LANG'; payload: Language }
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_GAME_MODE'; payload: FreeModeType }
  | { type: 'TOGGLE_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_FIRST_TIME'; payload: boolean }
  | { type: 'UPDATE_INPUT'; payload: { rowIndex: number; text: string } }
  | { type: 'ADD_COMMENT'; payload: AIComment }
  | { type: 'MOVE_CHAR'; payload: { charId: number; targetSlotIndex: number | null } }
  | { type: 'SET_FREE_PHRASE'; payload: string }
  | { type: 'UPDATE_FREE_INPUT'; payload: { rowIndex: number; mainInput?: string; prePunctuation?: string; postPunctuation?: string; nexo?: string } }
  | { type: 'ADD_FREE_WORD_TOKEN'; payload: { text: string; color?: string; slotIndex: number } }
  | { type: 'MOVE_FREE_WORD_TOKEN'; payload: { tokenId: number; targetSlotIndex: number | null } }
  | { type: 'SET_VOCAL_STANDALONE'; payload: { rowIndex: number; isStandalone: boolean } }
  | { type: 'REFRESH_SUGGESTIONS' }
  | { type: 'UPDATE_CHARACTER'; payload: { oldName: string; newName: string } }
  | { type: 'DELETE_CHARACTER'; payload: { name: string } }
  | { type: 'SET_VERTICAL_TITLE'; payload: string }
  | { type: 'SET_READ_ONLY_MODE'; payload: boolean }
  | { type: 'LOAD_SAVED_WORK'; payload: any }
  | { type: 'SETUP_CHALLENGE_MODE'; payload: { size: number } }
  | { type: 'DELETE_FREE_TOKEN'; payload: { tokenId: number } }
  | { type: 'USE_THEMATIC_WORD'; payload: { wordId: number; rowIndex: number } }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'COMPLETE_DAILY_CHALLENGE' };

const initialWord = "MAGIA";
const initialRows = initialWord.split('').map((letter, index) => ({
  index,
  baseLetter: letter,
  charSlot: index === 0 ? { id: 1, letter: '1', type: 'fixed' as const, slotIndex: 0 } 
            : index === 1 ? { id: 2, letter: '2', type: 'fixed' as const, slotIndex: 1 } 
            : null,
  inputText: ''
}));

const MALE_NAMES = ["Braulio", "Pablo", "Amadeo", "Lope", "Marcos", "Dante", "Enzo", "Félix", "Guido", "Hugo"];
const FEMALE_NAMES = ["Craulia", "Úrsula", "Elena", "Marta", "Silvia", "Inés", "Gema", "Julia", "Rosa", "Sara"];

const getRandomNames = () => ({
  male: MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)],
  female: FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
});

const initialState: GameState = {
  lang: 'es',
  screen: 'language',
  gameMode: 'challenge',
  firstTimeChallenge: true,
  suggestionsActive: false,
  dailyWord: initialWord,
  theme: "Un encuentro misterioso en la biblioteca",
  rows: initialRows,
  draggablePool: [
    { id: 3, letter: '3', type: 'draggable', slotIndex: null },
    { id: 4, letter: '4', type: 'draggable', slotIndex: null }
  ],
  comments: [],
  freePhrase: '',
  freeRows: [],
  freeWordTokens: [],
  characterColors: {},
  suggestedNames: getRandomNames(),
  verticalTitle: '',
  readOnlyMode: false,
  thematicWords: [],
  tutorialCompleted: localStorage.getItem('vertic_tutorial_completed') === 'true',
  dailyChallengeLastDone: localStorage.getItem('vertic_daily_done_date')
};

// Accents remover for the setup
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_LANG': return { ...state, lang: action.payload };
    case 'SET_SCREEN': return { ...state, screen: action.payload };
    case 'SET_GAME_MODE': return { ...state, gameMode: action.payload };
    case 'TOGGLE_SUGGESTIONS': return { ...state, suggestionsActive: action.payload };
    case 'SET_FIRST_TIME': return { ...state, firstTimeChallenge: action.payload };
    case 'SET_VERTICAL_TITLE': return { ...state, verticalTitle: action.payload };
    case 'SET_READ_ONLY_MODE': return { ...state, readOnlyMode: action.payload };
    case 'LOAD_SAVED_WORK': return {
       ...state,
       readOnlyMode: true,
       gameMode: action.payload.mode,
       freeRows: action.payload.freeRows,
       characterColors: action.payload.characterColors,
       freePhrase: action.payload.freePhrase,
       verticalTitle: action.payload.title
    };
    case 'UPDATE_INPUT': {
      const newRows = [...state.rows];
      newRows[action.payload.rowIndex].inputText = action.payload.text;
      return { ...state, rows: newRows };
    }
    case 'ADD_COMMENT': {
      return { ...state, comments: [...state.comments, action.payload] };
    }
    case 'MOVE_CHAR': {
      const poolChar = state.draggablePool.find(c => c.id === action.payload.charId);
      
      if (poolChar) {
        const newPool = state.draggablePool.filter(c => c.id !== poolChar.id);
        const newRows = [...state.rows];
        
        if (action.payload.targetSlotIndex !== null) {
           newRows[action.payload.targetSlotIndex] = {
             ...newRows[action.payload.targetSlotIndex],
             charSlot: { ...poolChar, slotIndex: action.payload.targetSlotIndex }
           }
        } else {
           newPool.push({ ...poolChar, slotIndex: null });
        }
        return { ...state, rows: newRows, draggablePool: newPool };
      } else {
         const sourceRow = state.rows.find(r => r.charSlot?.id === action.payload.charId);
         if (!sourceRow || !sourceRow.charSlot) return state;

         const movingChar = sourceRow.charSlot;
         const newRows = [...state.rows];
         const newPool = [...state.draggablePool];

         newRows[sourceRow.index] = { ...newRows[sourceRow.index], charSlot: null };

         if (action.payload.targetSlotIndex !== null) {
           newRows[action.payload.targetSlotIndex] = {
             ...newRows[action.payload.targetSlotIndex],
             charSlot: { ...movingChar, slotIndex: action.payload.targetSlotIndex }
           };
         } else {
           newPool.push({ ...movingChar, slotIndex: null });
         }

         return { ...state, rows: newRows, draggablePool: newPool };
      }
    }
    case 'SETUP_CHALLENGE_MODE': {
      const { size } = action.payload;
      const mNames = ["Víctor", "Héctor", "Hugo", "Leo", "Ramón"];
      const fNames = ["Clara", "Irene", "Alma", "Flora", "Silvia"];
      const char1Name = mNames[Math.floor(Math.random() * mNames.length)];
      const char2Name = fNames[Math.floor(Math.random() * fNames.length)];
      const allColors = ['#3b82f6', '#ef4444', '#10b981', '#eab308', '#ec4899', '#8b5cf6'];
      const char1Color = allColors[0];
      const char2Color = allColors[1];
      
      let phraseStr = "";
      const newFreeRows: FreeModeRowData[] = [];
      let thematicWords: any[] = [];
      
      if (size === 13) {
         phraseStr = "EL AIRE EN EL MAR";
         thematicWords = [
           { id: 1, word: 'ARENA', usedInRow: null },
           { id: 2, word: 'MAREA', usedInRow: null }
         ];
         // Prefill the first 3 letters as a starting phrase: "Estoy levantando al..."
         newFreeRows.push(
           { index: 0, baseLetter: 'E', leftToken: { id: 101, text: char1Name, color: char1Color, slotIndex: 0, isPrefilled: true }, mainInput: 'stoy', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true },
           { index: 1, baseLetter: 'L', leftToken: null, mainInput: 'evantando', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true },
           { index: 2, baseLetter: 'A', leftToken: null, mainInput: 'l', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true }
         );
      } else if (size === 26) {
         phraseStr = "EL AIRE LLEVA EL AROMA DE LA FLOR";
         thematicWords = [
           { id: 1, word: 'FLOR', usedInRow: null },
           { id: 2, word: 'AROMA', usedInRow: null }
         ];
         // Prefill the first 3 letters as a starting phrase: "En la academia..."
         newFreeRows.push(
           { index: 0, baseLetter: 'E', leftToken: { id: 101, text: char1Name, color: char1Color, slotIndex: 0, isPrefilled: true }, mainInput: 'n', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true },
           { index: 1, baseLetter: 'L', leftToken: null, mainInput: 'a', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true },
           { index: 2, baseLetter: 'A', leftToken: null, mainInput: 'cademia', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true }
         );
      } else {
         phraseStr = "EL AIRE LLEVA EL AROMA DE LA FLOR QUE NACE EN EL VALLE HOY";
         thematicWords = [
           { id: 1, word: 'VALLE', usedInRow: null },
           { id: 2, word: 'HOJAS', usedInRow: null }
         ];
         // Prefill the first 3 letters as a starting phrase: "Estoy ligando con Amanda" (using a nexo)
         newFreeRows.push(
           { index: 0, baseLetter: 'E', leftToken: { id: 101, text: char1Name, color: char1Color, slotIndex: 0, isPrefilled: true }, mainInput: 'stoy', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true },
           { index: 1, baseLetter: 'L', leftToken: null, mainInput: 'igando', prePunctuation: '', postPunctuation: '', nexo: 'con', isPrefilled: true },
           { index: 2, baseLetter: 'A', leftToken: null, mainInput: 'manda.', prePunctuation: '', postPunctuation: '', nexo: '', isPrefilled: true }
         );
      }

      const cleanPhrase = phraseStr.replace(/\s+/g, '');
      const charPos2 = Math.floor(cleanPhrase.length / 2) + Math.floor(Math.random() * 5);

      for (let i = 3; i < cleanPhrase.length; i++) {
        const baseLetter = cleanPhrase[i];
        let leftToken = null;
        if (i === charPos2) leftToken = { id: 102, text: char2Name, color: char2Color, slotIndex: i };

        newFreeRows.push({
          index: i,
          baseLetter,
          leftToken,
          mainInput: '',
          prePunctuation: '',
          postPunctuation: '',
          nexo: '',
          isPrefilled: false
        });
      }

      return {
        ...state,
        gameMode: 'challenge',
        freePhrase: phraseStr,
        freeRows: newFreeRows.sort((a,b) => a.index - b.index),
        characterColors: { [char1Name]: char1Color, [char2Name]: char2Color },
        readOnlyMode: false,
        thematicWords
      };
    }
    // FREE MODE ACTIONS
    case 'SET_FREE_PHRASE': {
      const basePhrase = action.payload.toUpperCase().replace(/\s+/g, '');
      const newFreeRows: FreeModeRowData[] = [];
      for (let i = 0; i < basePhrase.length; i++) {
        // Convert letter like Á to A
        const baseLetter = removeAccents(basePhrase[i]);
        newFreeRows.push({
          index: i,
          baseLetter,
          leftToken: null,
          mainInput: '',
          prePunctuation: '',
          postPunctuation: '',
          nexo: ''
        });
      }
      return { 
        ...state, 
        freePhrase: action.payload, 
        freeRows: newFreeRows, 
        freeWordTokens: [],
        characterColors: {},
        suggestionsActive: false
      };
    }
    case 'UPDATE_FREE_INPUT': {
      const { rowIndex, mainInput, prePunctuation, postPunctuation, nexo } = action.payload;
      const newFreeRows = [...state.freeRows];
      const target = { ...newFreeRows[rowIndex] };
      if (mainInput !== undefined) target.mainInput = mainInput;
      if (prePunctuation !== undefined) target.prePunctuation = prePunctuation;
      if (postPunctuation !== undefined) target.postPunctuation = postPunctuation;
      if (nexo !== undefined) target.nexo = nexo;
      newFreeRows[rowIndex] = target;

      let newThematicWords = [...state.thematicWords];
      if (mainInput !== undefined && state.gameMode === 'challenge') {
         const fullWord = removeAccents((target.baseLetter + mainInput).toLowerCase().trim());
         newThematicWords = newThematicWords.map(tw => {
            if (tw.usedInRow === rowIndex) {
               if (tw.word.toLowerCase() !== fullWord) {
                  return { ...tw, usedInRow: null };
               }
            } else if (tw.usedInRow === null) {
               if (tw.word.toLowerCase() === fullWord) {
                  return { ...tw, usedInRow: rowIndex };
               }
            }
            return tw;
         });
      }

      return { ...state, freeRows: newFreeRows, thematicWords: newThematicWords };
    }
    case 'USE_THEMATIC_WORD': {
      const { wordId, rowIndex } = action.payload;
      const wordObj = state.thematicWords.find(tw => tw.id === wordId);
      if (!wordObj) return state;

      const targetRow = state.freeRows[rowIndex];
      if (wordObj.word.charAt(0).toLowerCase() !== targetRow.baseLetter.toLowerCase()) {
         return state;
      }

      const newMainInput = wordObj.word.slice(1);
      const newFreeRows = [...state.freeRows];
      newFreeRows[rowIndex] = { ...newFreeRows[rowIndex], mainInput: newMainInput };

      const newThematicWords = state.thematicWords.map(tw => 
         tw.id === wordId ? { ...tw, usedInRow: rowIndex } : tw
      );

      return { ...state, freeRows: newFreeRows, thematicWords: newThematicWords };
    }
    case 'ADD_FREE_WORD_TOKEN': {
      const { text, slotIndex } = action.payload;
      const normalizedName = text.trim();
      
      // VALIDATION: Consecutive speech check
      const prevCharRow = [...state.freeRows.slice(0, slotIndex)].reverse().find(r => r.leftToken);
      if (prevCharRow && prevCharRow.leftToken?.text.toLowerCase() === normalizedName.toLowerCase()) {
        return state;
      }
      
      const nextCharRow = state.freeRows.slice(slotIndex + 1).find(r => r.leftToken);
      if (nextCharRow && nextCharRow.leftToken?.text.toLowerCase() === normalizedName.toLowerCase()) {
        return state;
      }

      const existingColor = state.characterColors[normalizedName];
      const usedColors = Object.values(state.characterColors);
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#eab308', '#ec4899', '#8b5cf6'];
      const availableColors = colors.filter(c => !usedColors.includes(c));
      const newColor = existingColor || action.payload.color || (availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)]);

      const newTokenId = Date.now();
      const newToken: FreeModeWordToken = {
        id: newTokenId,
        text: normalizedName,
        color: newColor,
        slotIndex: slotIndex
      };
      
      const newFreeTokens = [...state.freeWordTokens, newToken];
      const newFreeRows = [...state.freeRows];
      newFreeRows[slotIndex] = {
        ...newFreeRows[slotIndex],
        leftToken: newToken
      };

      return { 
        ...state, 
        freeWordTokens: newFreeTokens, 
        freeRows: newFreeRows,
        characterColors: { ...state.characterColors, [normalizedName]: newColor }
      };
    }
    case 'MOVE_FREE_WORD_TOKEN': {
      const { tokenId, targetSlotIndex } = action.payload;
      if (targetSlotIndex === null) {
        // Move back to pool? (Not really implemented in UI yet but let's handle state)
        const newTokens = state.freeWordTokens.map(t => t.id === tokenId ? { ...t, slotIndex: null } : t);
        const newFreeRows = state.freeRows.map(r => r.leftToken?.id === tokenId ? { ...r, leftToken: null } : r);
        return { ...state, freeWordTokens: newTokens, freeRows: newFreeRows };
      }

      const movingToken = state.freeWordTokens.find(t => t.id === tokenId);
      if (!movingToken) return state;

      // VALIDATION: Consecutive speech check
      const prevCharRow = [...state.freeRows.slice(0, targetSlotIndex)].reverse().find(r => r.leftToken);
      if (prevCharRow && prevCharRow.leftToken?.text.toLowerCase() === movingToken.text.toLowerCase()) {
        // Same character spoke just before. User says this is not allowed.
        // For now let's just block it. In a real app we might show an error.
        return state;
      }
      
      const nextCharRow = state.freeRows.slice(targetSlotIndex + 1).find(r => r.leftToken);
      if (nextCharRow && nextCharRow.leftToken?.text.toLowerCase() === movingToken.text.toLowerCase()) {
        return state;
      }

      // Clear old slot
      const newFreeRows = state.freeRows.map(r => r.leftToken?.id === tokenId ? { ...r, leftToken: null } : r);
      // Assign to new slot
      newFreeRows[targetSlotIndex] = { ...newFreeRows[targetSlotIndex], leftToken: { ...movingToken, slotIndex: targetSlotIndex } };
      
      const newTokens = state.freeWordTokens.map(t => t.id === tokenId ? { ...t, slotIndex: targetSlotIndex } : t);

      return { ...state, freeWordTokens: newTokens, freeRows: newFreeRows };
    }
    case 'SET_VOCAL_STANDALONE': {
      const { rowIndex, isStandalone } = action.payload;
      const newFreeRows = [...state.freeRows];
      newFreeRows[rowIndex] = { ...newFreeRows[rowIndex], isVocalStandalone: isStandalone };
      return { ...state, freeRows: newFreeRows };
    }
    case 'REFRESH_SUGGESTIONS': {
      return { ...state, suggestedNames: getRandomNames() };
    }
    case 'UPDATE_CHARACTER': {
      const { oldName, newName } = action.payload;
      const normalizedOld = oldName.trim();
      const normalizedNew = newName.trim();
      if (!normalizedNew || normalizedOld === normalizedNew) return state;

      const charColor = state.characterColors[normalizedOld];
      const newColors = { ...state.characterColors };
      delete newColors[normalizedOld];
      newColors[normalizedNew] = charColor;

      const newTokens = state.freeWordTokens.map(t => 
        t.text === normalizedOld ? { ...t, text: normalizedNew } : t
      );
      const newRows = state.freeRows.map(r => 
        r.leftToken?.text === normalizedOld 
          ? { ...r, leftToken: { ...r.leftToken, text: normalizedNew } } 
          : r
      );

      return { 
        ...state, 
        characterColors: newColors, 
        freeWordTokens: newTokens, 
        freeRows: newRows 
      };
    }
    case 'DELETE_CHARACTER': {
      const { name } = action.payload;
      const normalized = name.trim();
      
      const newColors = { ...state.characterColors };
      delete newColors[normalized];

      const newTokens = state.freeWordTokens.filter(t => t.text !== normalized);
      const newRows = state.freeRows.map(r => 
        r.leftToken?.text === normalized ? { ...r, leftToken: null } : r
      );

      return { 
        ...state, 
        characterColors: newColors, 
        freeWordTokens: newTokens, 
        freeRows: newRows 
      };
    }
    case 'DELETE_FREE_TOKEN': {
      const { tokenId } = action.payload;
      const newTokens = state.freeWordTokens.filter(t => t.id !== tokenId);
      const newRows = state.freeRows.map(r => 
        r.leftToken?.id === tokenId ? { ...r, leftToken: null } : r
      );
      return { ...state, freeWordTokens: newTokens, freeRows: newRows };
    }
    case 'COMPLETE_TUTORIAL': {
      localStorage.setItem('vertic_tutorial_completed', 'true');
      return { ...state, tutorialCompleted: true };
    }
    case 'COMPLETE_DAILY_CHALLENGE': {
      const today = new Date().toISOString();
      localStorage.setItem('vertic_daily_done_date', today);
      return { ...state, dailyChallengeLastDone: today };
    }
    default: return state;
  }
}

export const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => undefined
});

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
