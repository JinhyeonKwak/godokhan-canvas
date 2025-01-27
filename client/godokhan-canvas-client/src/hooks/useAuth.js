import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true, // 세션 쿠키 자동 포함
        });

        if (res.status === 200) {
          setIsAuthenticated(true);
          console.log("Logged in");
        } else {
          setIsAuthenticated(false);
          console.log("Not authenticated");
        }
      } catch (err) {
        setIsAuthenticated(false);
        setError(err);
        console.error("Error checking session:", err);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    checkSession();
  }, []);

  return { isAuthenticated, loading, error };
};

export default useAuth;
