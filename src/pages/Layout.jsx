

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ListChecks, LayoutDashboard, Plus, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="h-16 max-w-md mx-auto px-4 grid grid-cols-5 items-center">
          <Link
            to={createPageUrl("Home")}
            className={cn(
              "flex flex-col items-center gap-1",
              isCurrentPath('/') ? "text-blue-600" : "text-gray-600"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to={createPageUrl("Trips")}
            className={cn(
              "flex flex-col items-center gap-1",
              isCurrentPath('/Trips') ? "text-blue-600" : "text-gray-600"
            )}
          >
            <ListChecks className="w-5 h-5" />
            <span className="text-xs">Trips</span>
          </Link>

          <Link
            to={createPageUrl("ListManager")}
            className={cn(
              "flex flex-col items-center gap-1",
              isCurrentPath('/ListManager') ? "text-blue-600" : "text-gray-600"
            )}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">Lists</span>
          </Link>

          <Link
            to={createPageUrl("Settings")}
            className={cn(
              "flex flex-col items-center gap-1",
              isCurrentPath('/Settings') ? "text-blue-600" : "text-gray-600"
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>

          <Link
            to={createPageUrl("New")}
            className="flex flex-col items-center -mt-8"
          >
            <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-600">New</span>
          </Link>
        </div>

        {/* Safe Area Padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white" />
      </nav>
    </div>
  );
}

