import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ListChecks, LayoutDashboard, Plus, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPage = page => {
    const p = location.pathname.toLowerCase();
    switch (page) {
      case 'Home':
        return p === '/' || p === '/home';
      case 'Trips':
        return p === '/trips';
      case 'ListManager':
        return p === '/listmanager';
      case 'Settings':
        return p === '/settings';
      default:
        return p.endsWith(`/${page.toLowerCase()}`);
    }
  };

  const isNewPage =
    location.pathname === '/New' ||
    location.pathname === '/new' ||
    location.pathname.toLowerCase().includes('new');

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main content */}
      <main className={`flex-1 overflow-auto mobile-scroll-optimized ${isNewPage ? 'pb-6' : 'pb-nav-safe'}`}>{children}</main>

      {/* Bottom Navigation Bar - Hidden on New page */}
      {!isNewPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 supports-[backdrop-filter]:bg-background/80 backdrop-blur">
          <div className="h-16 max-w-md mx-auto px-4 grid grid-cols-5 items-center">
            <Link
              to={createPageUrl('Home')}
              className={cn('flex flex-col items-center gap-1', isCurrentPage('Home') ? 'text-primary' : 'text-muted-foreground')}
            >
              <div className={cn('h-9 w-16 rounded-full flex items-center justify-center transition-colors', isCurrentPage('Home') ? 'bg-primary/15' : '')}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className={cn('text-[11px] mt-0.5', isCurrentPage('Home') ? 'font-medium' : '')}>Home</span>
            </Link>

            <Link
              to={createPageUrl('Trips')}
              className={cn('flex flex-col items-center gap-1', isCurrentPage('Trips') ? 'text-primary' : 'text-muted-foreground')}
            >
              <div className={cn('h-9 w-16 rounded-full flex items-center justify-center transition-colors', isCurrentPage('Trips') ? 'bg-primary/15' : '')}>
                <ListChecks className="w-5 h-5" />
              </div>
              <span className={cn('text-[11px] mt-0.5', isCurrentPage('Trips') ? 'font-medium' : '')}>Trips</span>
            </Link>

            <Link
              to={createPageUrl('ListManager')}
              className={cn('flex flex-col items-center gap-1', isCurrentPage('ListManager') ? 'text-primary' : 'text-muted-foreground')}
            >
              <div className={cn('h-9 w-16 rounded-full flex items-center justify-center transition-colors', isCurrentPage('ListManager') ? 'bg-primary/15' : '')}>
                <Briefcase className="w-5 h-5" />
              </div>
              <span className={cn('text-[11px] mt-0.5', isCurrentPage('ListManager') ? 'font-medium' : '')}>Lists</span>
            </Link>

            <Link
              to={createPageUrl('Settings')}
              className={cn('flex flex-col items-center gap-1', isCurrentPage('Settings') ? 'text-primary' : 'text-muted-foreground')}
            >
              <div className={cn('h-9 w-16 rounded-full flex items-center justify-center transition-colors', isCurrentPage('Settings') ? 'bg-primary/15' : '')}>
                <User className="w-5 h-5" />
              </div>
              <span className={cn('text-[11px] mt-0.5', isCurrentPage('Settings') ? 'font-medium' : '')}>Profile</span>
            </Link>

            <Link
              to={createPageUrl('New')}
              className="flex flex-col items-center -mt-8"
            >
              <div className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-tr from-primary to-accent">
                <Plus className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-[11px] mt-1 text-muted-foreground">New</span>
            </Link>
          </div>

          {/* Safe Area Padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)] bg-card" />
        </nav>
      )}
    </div>
  );
}
