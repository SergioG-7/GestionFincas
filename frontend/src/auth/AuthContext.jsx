import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { getToken, getUsername, guardarSesion, limpiarSesion } from './authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [username, setUsername] = useState(getUsername);

  const login = useCallback((nuevoToken, nuevoUsername, rememberMe) => {
    guardarSesion(nuevoToken, nuevoUsername, rememberMe);
    setToken(nuevoToken);
    setUsername(nuevoUsername);
  }, []);

  const logout = useCallback(() => {
    limpiarSesion();
    setToken(null);
    setUsername(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get('/auth/verify').catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
