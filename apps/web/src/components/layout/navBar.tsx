import { Bell, User, LogOut } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "@/services/api";
import { getCurrentUser } from "@/pages/profile/services/profile.service";

function NavBar() {
    const navigate = useNavigate();
    const [operatorName, setOperatorName] = useState("Operator");

    useEffect(() => {
      getCurrentUser()
        .then((user) => setOperatorName(user.name))
        .catch(() => setOperatorName("Operator"));
    }, []);

    const handleLogout = async () => {
      await clearAuthSession();
      navigate("/auth/login");
    };

    const TopBarClock = memo(function TopBarClock() {
      const [time, setTime] = useState(() => new Date());
    
      useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
      }, []);
    
      return (
        <div>
          <p className="text-sm text-gray-400">
            {time.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xl font-semibold">{time.toLocaleTimeString()}</p>
        </div>
      );
    });
    return (
        <div className="flex justify-between items-center px-5 py-4 bg-[#1A2333] border-b border-gray-800">
        <TopBarClock />

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-300" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1.5 py-0.5 rounded-full">
              3
            </span>
          </div>

          {/* User */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-slate-800/70"
            title="Open profile"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{operatorName}</p>
              <p className="text-xs text-gray-400">Operator</p>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 ml-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
}
export default NavBar;
