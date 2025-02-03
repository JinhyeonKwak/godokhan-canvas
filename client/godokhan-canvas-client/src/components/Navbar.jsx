import { Home, LogIn, LogOut, Clock } from "lucide-react";
import { useAuthContext } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useAuthContext();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (isAuthenticated) {
      setUser(null);
      setIsAuthenticated(false);
    } else {
      navigate("/login");
    }
  }

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          className="text-white flex items-center p-2 hover:bg-gray-700 rounded-md"
          onClick={() => alert("Home Clicked!")}
        >
          <Home className="w-5 h-5 mr-2" />
          Home
        </button>
        <button
          className="text-white flex items-center p-2 hover:bg-gray-700 rounded-md"
          onClick={() => alert("Timelapse Clicked!")}
        >
          <Clock className="w-5 h-5 mr-2" />
          Timelapse
        </button>
      </div>
      <button
        className="text-white flex items-center p-2 hover:bg-gray-700 rounded-md"
        onClick={handleAuth}
      >
        {isAuthenticated ? (
          <>
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </>
        )}
      </button>
    </nav>
  );
}
