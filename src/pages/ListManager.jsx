
import React, { useState, useEffect } from "react";
import { List } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  Loader2, Plus, Edit,
  Activity, Home, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { withRetry } from "../components/utils/api-helpers";
import CustomListForm from "../components/lists/CustomListForm";

export default function ListManagerPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState({
    activity: [],
    accommodation: [],
    companion: []
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null); // activity, accommodation, companion, or null

  // Categories configuration with icons and descriptions
  const listTypes = {
    activity: {
      name: "Activities",
      description: "Items needed for specific activities",
      icon: <Activity className="w-5 h-5" />,
      categories: [
        { id: "beach", label: "Beach Trip", icon: "🏖️" },
        { id: "camping", label: "Camping", icon: "🏕️" },
        { id: "climbing", label: "Climbing", icon: "🧗" },
        { id: "hiking", label: "Hiking", icon: "🥾" },
        { id: "partying", label: "Party", icon: "🎉" },
        { id: "business", label: "Business", icon: "💼" },
        { id: "sightseeing", label: "Sightseeing", icon: "🏛️" }
      ]
    },
    accommodation: {
      name: "Accommodation",
      description: "Items based on where you're staying",
      icon: <Home className="w-5 h-5" />,
      categories: [
        { id: "hotel", label: "Hotel", icon: "🏨" },
        { id: "camping", label: "Camping", icon: "🏕️" },
        { id: "glamping", label: "Glamping", icon: "⛺" },
        { id: "couch_surfing", label: "Couch Surfing", icon: "🛋️" },
        { id: "airbnb", label: "Airbnb", icon: "🏠" }
      ]
    },
    companion: {
      name: "Travel Companions",
      description: "Items depending on who you're traveling with",
      icon: <Users className="w-5 h-5" />,
      categories: [
        { id: "alone", label: "Solo Travel", icon: "🧍" },
        { id: "spouse", label: "With Partner", icon: "💑" },
        { id: "friends", label: "With Friends", icon: "👥" },
        { id: "family", label: "With Family", icon: "👨‍👩‍👧" }
      ]
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setLoading(true);
    try {
      const user = await withRetry(() => User.me());
      
      if (!user.has_initialized_base_lists) {
        await initializeUser(user.id);
      }
      
      const fetchedLists = await withRetry(() => 
        List.filter({ owner_id: user.id })
      );
      
      setLists({
        activity: fetchedLists.filter(l => l.list_type === 'activity'),
        accommodation: fetchedLists.filter(l => l.list_type === 'accommodation'),
        companion: fetchedLists.filter(l => l.list_type === 'companion')
      });
    } catch (error) {
      console.error("Error loading lists:", error);
      toast({
        title: "Error",
        description: "Failed to load lists. Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeUser = async (userId) => {
    try {
      // Mark user as initialized
      await User.updateMyUserData({ has_initialized_base_lists: true });
    } catch (error) {
      console.error("Error initializing default lists:", error);
    }
  };

  const handleEditList = (listType, categoryId) => {
    navigate(createPageUrl(`ListEditor?type=${listType}&category=${categoryId}`));
  };

  const handleAddList = (listType) => {
    setCreating(listType);
  };

  const handleSaveCustomList = async (customList) => {
    try {
      const user = await User.me();
      
      // Check if a list with this category already exists
      const existingList = lists[customList.list_type].find(
        list => list.category === customList.category
      );
      
      if (existingList) {
        toast({
          title: "List already exists",
          description: "A list with this name already exists",
          variant: "destructive"
        });
        return;
      }
      
      // Create the new list
      await List.create({
        list_type: customList.list_type,
        category: customList.category,
        name: customList.name,
        icon: customList.icon,
        items: [],
        owner_id: user.id,
        is_default: false
      });
      
      // Reload lists to show the new one
      await loadLists();
      
      toast({
        title: "List created",
        description: "Your new list has been created successfully"
      });
      
      // Close the form
      setCreating(null);
      
      // Navigate to edit the new list
      navigate(createPageUrl(`ListEditor?type=${customList.list_type}&category=${customList.category}`));
    } catch (error) {
      console.error("Error creating custom list:", error);
      toast({
        title: "Error",
        description: "Failed to create list. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading your lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Packing Lists</h1>
          <p className="text-gray-500">Manage your reusable packing templates</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Scrollable page with all list types */}
        <div className="space-y-8">
          {Object.entries(listTypes).map(([typeId, typeConfig]) => (
            <div key={typeId} className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  {typeConfig.icon}
                  <h2 className="text-xl font-bold">{typeConfig.name}</h2>
                </div>
                <p className="text-gray-500 mt-1">{typeConfig.description}</p>
              </div>
              
              <div className="p-2">
                {creating === typeId ? (
                  <div className="p-2">
                    <CustomListForm 
                      listType={typeId}
                      onCancel={() => setCreating(null)}
                      onSave={handleSaveCustomList}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                    {/* Show both system categories and any custom ones for this type */}
                    {[
                      ...typeConfig.categories,
                      ...lists[typeId]
                        .filter(list => !typeConfig.categories.some(c => c.id === list.category))
                        .map(list => ({
                          id: list.category,
                          label: list.name || list.category,
                          icon: list.icon || "📋",
                          custom: true
                        }))
                    ].map((category) => {
                      const existingList = lists[typeId].find(l => l.category === category.id);
                      const hasItems = existingList && existingList.items && existingList.items.length > 0;
                      
                      return (
                        <div 
                          key={category.id}
                          onClick={() => handleEditList(typeId, category.id)}
                          className="flex items-center p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center flex-1">
                            <span className="text-2xl mr-3">{category.icon}</span>
                            <div>
                              <p className="font-medium">{category.label}</p>
                              {hasItems && (
                                <p className="text-xs text-gray-500">
                                  {existingList.items.length} items
                                </p>
                              )}
                              {category.custom && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  Custom
                                </span>
                              )}
                            </div>
                          </div>
                          <Edit className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Add button */}
              <div className="p-4 border-t flex justify-center">
                {creating === typeId ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setCreating(null)}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleAddList(typeId)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add new {typeConfig.name.toLowerCase().replace(/s$/, '')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
