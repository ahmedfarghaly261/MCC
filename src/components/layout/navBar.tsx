import { Bell, User } from "lucide-react";
import { memo, useState, useEffect } from "react";

function NavBar() {
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Mission Control</p>
              <p className="text-xs text-gray-400">Operator</p>
            </div>
          </div>
        </div>
      </div>
    );
}
export default NavBar;