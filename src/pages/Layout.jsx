
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, LayoutDashboard, Menu, X, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Disable pinch-to-zoom
  useEffect(() => {
    document.addEventListener('touchmove', function(event) {
      if (event.scale !== 1) { 
        event.preventDefault();
      }
    }, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', function(event) {
        if (event.scale !== 1) {
          event.preventDefault();
        }
      });
    };
  }, []);

  const handleLogoClick = () => {
    navigate(createPageUrl("Home"));
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4">
          <div 
            className="text-xl font-bold flex items-center gap-2 cursor-pointer" 
            onClick={handleLogoClick}
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/44165e_thehizki_Minimalist_modern_web_app_logo_for_a_travel_and_packin_e1d8508e-b43c-44a9-88f4-186b1b61ef74.png" 
              alt="Packly Logo" 
              className="h-8 w-auto"
            />
            Packly
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="px-4 py-2 flex flex-col h-[calc(100%-80px)] justify-between">
          <div className="space-y-1">
            <Link
              to={createPageUrl("Home")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              Home
            </Link>
            <Link
              to={createPageUrl("Lists")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <FileText className="w-5 h-5" />
              My Lists
            </Link>
            <Link
              to={createPageUrl("New")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <FileText className="w-5 h-5" />
              New List
            </Link>
            <Link
              to={createPageUrl("Settings")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
          
          <div className="mt-auto">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
