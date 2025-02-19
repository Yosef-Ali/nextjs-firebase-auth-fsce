import { auth } from '@/lib/firebase';
import { cookies } from 'next/headers';

export class TokenService {
  private static instance: TokenService;

  private constructor() {}

  static getInstance(): TokenService {
    if (!this.instance) {
      this.instance = new TokenService();
    }
    return this.instance;
  }

  async getToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    try {
      return await currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      return await currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }
}

export const tokenService = TokenService.getInstance();