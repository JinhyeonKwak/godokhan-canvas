import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: 새로고침할 때마다 요청 계속 보내는 것 수정
  useEffect(() => {
    if (isAuthenticated) return;
    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, setIsAuthenticated,
      user, setUser,
      loading, setLoading,
      error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
