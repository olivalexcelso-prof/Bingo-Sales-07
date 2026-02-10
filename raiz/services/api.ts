
import { SERVER_URL } from '../constants';
import { User, BingoCard, GameState } from '../types';

export const bingoApi = {
  // Login de usuário existente
  async login(data: any): Promise<{ user: User; cards: BingoCard[] }> {
    const response = await fetch(`${SERVER_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Falha no login');
    return response.json();
  },

  // Cadastro de NOVO usuário (Envia ao servidor)
  async register(data: any): Promise<{ user: User; cards: BingoCard[] }> {
    const response = await fetch(`${SERVER_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Falha ao criar conta no servidor');
    return response.json();
  },

  async getGameState(userId: string): Promise<GameState> {
    const response = await fetch(`${SERVER_URL}/api/v1/game/status?userId=${userId}`);
    if (!response.ok) throw new Error('Erro de sincronização');
    return response.json();
  },

  async requestCredit(userId: string): Promise<{ url: string }> {
    const response = await fetch(`${SERVER_URL}/api/v1/finance/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  async requestWithdraw(data: any): Promise<{ status: string }> {
    const response = await fetch(`${SERVER_URL}/api/v1/finance/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async sendSupport(userId: string, message: string): Promise<{ success: boolean; whatsappUrl?: string }> {
    const response = await fetch(`${SERVER_URL}/api/v1/support/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    return response.json();
  }
};
