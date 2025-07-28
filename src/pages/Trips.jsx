
import React, { useState, useEffect } from "react";
import { PackingList } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, Search, ListChecks, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LottieSpinner from "../components/ui/lottie-spinner";
import { toast } from "@/components/ui/use-toast";

export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndTrips();
  }, []);

  // Escape key navigation
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        navigate(createPageUrl("Home"));
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [navigate]);

  const loadUserAndTrips = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      await loadTrips(currentUser.id);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async (userId) => {
    try {
      // Get only the user's packing lists
      const fetchedTrips = await PackingList.filter(
        { owner_id: userId },
        "-created_date"
      );
      setTrips(fetchedTrips);
    } catch (error) {
      console.error("Error loading trips:", error);
    }
  };

  const deleteTrip = async (id) => {
    try {
      await PackingList.delete(id);
      if (user) {
        loadTrips(user.id);
      }
      toast({
        title: "Trip deleted",
        description: "Your trip has been deleted"
      });
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error",
        description: "Failed to delete the trip",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (trip) => {
    try {
      await PackingList.update(trip.id, { 
        ...trip, 
        is_favorite: !trip.is_favorite 
      });
      if (user) {
        loadTrips(user.id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesName = trip.name ? 
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      
    const matchesDestination = trip.destinations && trip.destinations.length > 0 && trip.destinations[0].location
      ? trip.destinations[0].location.toLowerCase().includes(searchQuery.toLowerCase())
      : trip.destination
        ? trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

    const matchesSearch = matchesName || matchesDestination;
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "favorites" && trip.is_favorite);
    return matchesSearch && matchesTab;
  });

  const getDestinationName = (trip) => {
    if (trip.name) {
      return trip.name;
    }
    if (trip.destinations && trip.destinations.length > 0) {
      return trip.destinations[0].location;
    }
    return trip.destination || "Unnamed Trip";
  };

  const getDateRange = (trip) => {
    if (trip.destinations && trip.destinations.length > 0) {
      return {
        start: new Date(trip.destinations[0].start_date),
        end: new Date(trip.destinations[0].end_date)
      };
    }
    return {
      start: new Date(trip.start_date),
      end: new Date(trip.end_date)
    };
  };

  const handleViewTrip = (tripId) => {
    navigate(createPageUrl(`ListDetail?id=${tripId}`));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <LottieSpinner size={120} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header - Updated to match Lists page style */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-gray-500">Manage your travel plans and packing lists</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 w-full mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Trips</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4">
          {filteredTrips.map(trip => (
            <Card key={trip.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{getDestinationName(trip)}</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={trip.is_favorite ? "text-yellow-400" : "text-gray-400"}
                        onClick={() => toggleFavorite(trip)}
                      >
                        <Star className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {format(getDateRange(trip).start, "MMM d")} - {format(getDateRange(trip).end, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => deleteTrip(trip.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {trip.activities && trip.activities.map(activity => (
                      <Badge key={activity} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ListChecks className="w-4 h-4" />
                      <span className="text-sm">
                        {trip.items ? `${trip.items.filter(item => item.is_packed).length} / ${trip.items.length} items packed` : '0 items'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTrip(trip.id)}
                    >
                      View Trip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : activeTab === "favorites"
                    ? "You haven't favorited any trips yet"
                    : "Start by creating your first trip"
                }
              </p>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate(createPageUrl("New"))}
              >
                Create New Trip
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
