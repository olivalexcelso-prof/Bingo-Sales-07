
export interface User {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  saldo: number;
}

export interface BingoCard {
  id: string;
  numbers: (number | null)[][]; // 5x5 grid
  marked: boolean[][];
  distanceToPrize: number; // calculated by server
  prizeType?: 'quadra' | 'linha' | 'bingo';
}

export interface GameState {
  currentBall: number | null;
  history: number[];
  isWinner: boolean;
  winnerName?: string;
  winnerCardId?: string;
  prizes: {
    quadra: number;
    linha: number;
    bingo: number;
    acumulado: number;
    totalAcumulado: number;
    activePrize: 'quadra' | 'linha' | 'bingo' | 'none';
  };
  narrationUrl?: string;
  approximation?: {
    cardId: string;
    type: 'quadra' | 'linha' | 'bingo';
    ballsMissing: number;
  };
  ad?: {
    content: string;
    duration: number;
  };
}

export type View = 'login' | 'game' | 'finance' | 'support';
