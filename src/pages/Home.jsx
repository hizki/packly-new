
import React, { useState, useEffect } from "react";
import { PackingList } from "@/api/entities";
import { User } from "@/api/entities";
import { TipList } from '@/api/entities';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks, Star, Calendar, Plane, MapPin, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";
import LottieSpinner from "../components/ui/lottie-spinner";
import { toast } from "@/components/ui/use-toast";
import { withRetry } from "../components/utils/api-helpers";

export default function HomePage() {
  const navigate = useNavigate();
  const [recentLists, setRecentLists] = useState([]);
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [upcomingTrip, setUpcomingTrip] = useState(null);
  const [upcomingTips, setUpcomingTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndLists();
  }, []);

  const loadUserAndLists = async () => {
    setLoading(true);
    try {
      const currentUser = await withRetry(() => User.getCurrentUser());
      setUser(currentUser);
      
      if (currentUser && !currentUser.has_initialized_base_lists) {
        await initializeUser(currentUser.id);
      }
      
      if (currentUser) {
        await loadLists(currentUser.id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // User is authenticated at this point, so this is likely a data loading issue
      toast({
        title: "Error loading data",
        description: "Some features may not work properly. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeUser = async (userId) => {
    try {
      await withRetry(() => User.updateMyUserData({ has_initialized_base_lists: true }));
    } catch (error) {
      console.error("Error initializing user:", error);
      toast({
        title: "Error initializing user",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };

  const checkForUpcomingTips = async (lists) => {
    try {
      if (!lists || lists.length === 0) return;

      const user = await withRetry(() => User.me());
      const tipLists = await withRetry(() => TipList.filter({ owner_id: user.id }));
      
      for (const list of lists) {
        if (!list.destinations || list.destinations.length === 0) continue;

        const startDate = new Date(list.destinations[0].start_date);
        const today = new Date();
        const daysUntilTrip = differenceInDays(startDate, today);

        if (daysUntilTrip <= 3 && daysUntilTrip > 0) {
          setUpcomingTips({
            type: 'day_before',
            listId: list.id,
            tips: tipLists.find(t => t.list_type === 'day_before')?.tips || []
          });
          break;
        } else if (daysUntilTrip === 0) {
          setUpcomingTips({
            type: 'before_leaving',
            listId: list.id,
            tips: tipLists.find(t => t.list_type === 'before_leaving')?.tips || []
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error checking for upcoming tips:', error);
      toast({
        title: "Error checking for upcoming tips",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };

  const loadLists = async (userId) => {
    try {
      const lists = await withRetry(() => 
        PackingList.filter({ owner_id: userId }, "-created_date")
      );
      
      setRecentLists(lists.slice(0, 3));
      setFavoriteLists(lists.filter(list => list.is_favorite).slice(0, 3));
      
      await checkForUpcomingTips(lists);
      findUpcomingTrip(lists);
    } catch (error) {
      console.error("Error loading lists:", error);
      toast({
        title: "Error loading lists",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };
  
  const findUpcomingTrip = (lists) => {
    const today = new Date();
    
    const upcoming = lists.filter(list => {
      if (!list.destinations || list.destinations.length === 0) return false;
      
      const startDate = new Date(list.destinations[0].start_date);
      const daysUntil = differenceInDays(startDate, today);
      
      return daysUntil >= 0 && daysUntil <= 3;
    });
    
    if (upcoming.length > 0) {
      upcoming.sort((a, b) => {
        const dateA = new Date(a.destinations[0].start_date);
        const dateB = new Date(b.destinations[0].start_date);
        return dateA - dateB;
      });
      
      setUpcomingTrip(upcoming[0]);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getDestinationInfo = (list) => {
    if (list.destinations && list.destinations.length > 0) {
      return {
        name: list.name || list.destinations[0].location,
        startDate: list.destinations[0].start_date,
        endDate: list.destinations[0].end_date
      };
    }
    return {
      name: list.name || list.destination || "Unnamed Trip",
      startDate: list.start_date,
      endDate: list.end_date
    };
  };
  
  const getDaysUntil = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const days = differenceInDays(targetDate, today);
    
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    return `in ${days} days`;
  };

  const handleListClick = (listId) => {
    navigate(createPageUrl(`ListDetail?id=${listId}`));
  };

  const handleLogoClick = () => {
    navigate(createPageUrl("Home"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <LottieSpinner size={120} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4" onClick={handleLogoClick}>
            <img 
              src="/packly-logo.png" 
              alt="Packly Logo" 
              className="h-24 w-auto cursor-pointer"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user?.full_name?.split(' ')[0] || 'Traveler'}
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Never forget a thing. Create smart packing lists tailored to your trips.
          </p>
          
          {upcomingTrip && (
            <Card className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Plane className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">
                        Get Ready! You're traveling {getDaysUntil(upcomingTrip.destinations[0].start_date)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {upcomingTrip.destinations[0].location} 
                          <span className="mx-1">•</span> 
                          {formatDate(upcomingTrip.destinations[0].start_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleListClick(upcomingTrip.id)}
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    View Packing List
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingTips && (
            <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      {upcomingTips.type === 'day_before' ? (
                        <Calendar className="w-6 h-6" />
                      ) : (
                        <Home className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">
                        {upcomingTips.type === 'day_before' 
                          ? "Time to prepare for your trip!" 
                          : "Ready to leave?"}
                      </h3>
                      <p className="text-white/80">
                        {upcomingTips.type === 'day_before'
                          ? `${upcomingTips.tips.length} preparation tasks to complete`
                          : "Check these items before heading out"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="whitespace-nowrap"
                    onClick={() => navigate(createPageUrl(`ListDetail?id=${upcomingTips.listId}`))}
                  >
                    View Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Link to={createPageUrl("New")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Create New Trip
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Favorite Trips
                </h2>
                <Link to={createPageUrl("Trips")}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {favoriteLists.length > 0 ? (
                  favoriteLists.map(list => {
                    const destInfo = getDestinationInfo(list);
                    return (
                      <div 
                        key={list.id} 
                        onClick={() => handleListClick(list.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                          <div>
                            <h3 className="font-medium">{destInfo.name}</h3>
                            <p className="text-sm text-gray-500">
                              {destInfo.startDate && destInfo.endDate ? (
                                <>
                                  {formatDate(destInfo.startDate)} - {formatDate(destInfo.endDate)}
                                </>
                              ) : (
                                "Dates not set"
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {list.activities && list.activities.slice(0, 2).map(activity => (
                              <span 
                                key={activity} 
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No favorite lists yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-blue-500" />
                  Recent Trips
                </h2>
                <Link to={createPageUrl("Trips")}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {recentLists.length > 0 ? (
                  recentLists.map(list => {
                    const destInfo = getDestinationInfo(list);
                    return (
                      <div 
                        key={list.id}
                        onClick={() => handleListClick(list.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                          <div>
                            <h3 className="font-medium">{destInfo.name}</h3>
                            <p className="text-sm text-gray-500">
                              {destInfo.startDate && destInfo.endDate ? (
                                <>
                                  {formatDate(destInfo.startDate)} - {formatDate(destInfo.endDate)}
                                </>
                              ) : (
                                "Dates not set"
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {list.activities && list.activities.slice(0, 2).map(activity => (
                              <span 
                                key={activity} 
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No lists created yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
