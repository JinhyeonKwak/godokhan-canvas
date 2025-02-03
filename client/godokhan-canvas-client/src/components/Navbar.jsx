import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, LogIn, LogOut, Clock } from "lucide-react";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleAuth = () => {
        setIsLoggedIn(!isLoggedIn);
    };

    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-white" onClick={() => alert("Home Clicked!")}>
                    <Home className="w-5 h-5 mr-2" /> Home
                </Button>
                <Button variant="ghost" className="text-white" onClick={() => alert("Timelapse Clicked!")}>
                    <Clock className="w-5 h-5 mr-2" /> Timelapse
                </Button>
            </div>
            <Button variant="ghost" className="text-white" onClick={handleAuth}>
                {isLoggedIn ? <LogOut className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                {isLoggedIn ? "Logout" : "Login"}
            </Button>
        </nav>
    );
}
