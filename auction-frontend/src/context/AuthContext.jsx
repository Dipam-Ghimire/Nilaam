import { createContext, useState, useEffect } from 'react';
import { login as loginApi } from '../api/auth';
import {register as registerApi} from '../api/auth';
import { getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((response) => setUser(response.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(credentials) {
    const response = await loginApi(credentials);
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  }

  async function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }
  async function register(data) {
  const response = await registerApi(data);
  const { user, token } = response.data;

  localStorage.setItem('token', token);
  setUser(user);
  return response.data;
}

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}