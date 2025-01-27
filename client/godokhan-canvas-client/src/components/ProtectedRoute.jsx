import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useAuth();
  
  console.log("Authenticated:", isAuthenticated);
  console.log("Loading:", loading);

  if (loading) {
    return <div>⏳ 인증 상태 확인 중...</div>; // 로딩 화면 추가
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
