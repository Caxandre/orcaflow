import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, TOKEN_KEY } from '../services/api';
import type { ApiResponse, User } from '../types';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!sessionStorage.getItem(TOKEN_KEY)) { setLoading(false); return; }
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      setUser(response.data.data);
    } catch { sessionStorage.removeItem(TOKEN_KEY); setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadUser();
    const expired = () => setUser(null);
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    sessionStorage.setItem(TOKEN_KEY, response.data.data.token);
    setUser(response.data.data.user);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* a sessão local ainda deve ser encerrada */ }
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
