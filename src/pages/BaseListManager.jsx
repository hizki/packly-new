
import React, { useState, useEffect } from "react";
import { BaseList } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, Loader2, Plus, Tag, Trash2, Save, HelpCircle,
  Briefcase, Home, Users, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ListManagerPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState("activity");
  const [baseLists, setBaseLists] = useState({
    activity: [],
    accommodation: [],
    companion: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentItems, setCurrentItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("essentials");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

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

  const itemCategories = [
    { value: "clothing", label: "Clothing" },
    { value: "toiletries", label: "Toiletries" },
    { value: "tech", label: "Tech" },
    { value: "gear", label: "Gear" },
    { value: "essentials", label: "Essentials" }
  ];

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const list = baseLists[activeType].find(l => l.category === selectedCategory);
      setCurrentItems(list?.items || []);
    } else {
      setCurrentItems([]);
    }
  }, [selectedCategory, baseLists]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      
      if (!user.has_initialized_base_lists) {
        await initializeDefaultBaseLists(user.id);
      }
      
      const lists = await BaseList.filter({ owner_id: user.id });
      
      setBaseLists({
        activity: lists.filter(l => l.list_type === 'activity'),
        accommodation: lists.filter(l => l.list_type === 'accommodation'),
        companion: lists.filter(l => l.list_type === 'companion')
      });
    } catch (error) {
      console.error("Error loading base lists:", error);
      toast({
        title: "Error",
        description: "Failed to load base lists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem = {
      name: newItemName,
      category: newItemCategory,
      quantity: parseInt(newItemQuantity),
      weather_dependent: false,
      weather_type: "any"
    };

    setCurrentItems([...currentItems, newItem]);
    setNewItemName("");
    setNewItemQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setCurrentItems(currentItems.filter((_, i) => i !== index));
  };

  const handleSaveList = async () => {
    try {
      const user = await User.me();
      const existingList = baseLists[activeType].find(l => l.category === selectedCategory);

      if (existingList) {
        await BaseList.update(existingList.id, {
          items: currentItems
        });
      } else {
        await BaseList.create({
          list_type: activeType,
          category: selectedCategory,
          items: currentItems,
          owner_id: user.id,
          is_default: false
        });
      }

      toast({
        title: "Success",
        description: "Base list saved successfully"
      });

      loadLists();
    } catch (error) {
      console.error("Error saving list:", error);
      toast({
        title: "Error",
        description: "Failed to save list",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading your base lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl("Settings"))}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Packing Lists</h1>
              <p className="text-gray-500">Manage your reusable packing templates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-100 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">About Packing Lists</p>
                <p className="text-blue-800">
                  These lists are templates that automatically populate your trips based on your trip details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs Interface */}
        <Tabs value={activeType} onValueChange={setActiveType} className="space-y-6">
          <div className="bg-white rounded-lg border p-1">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="activity" className="py-3">
                <Activity className="w-4 h-4 mr-2" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="accommodation" className="py-3">
                <Home className="w-4 h-4 mr-2" />
                Accommodation
              </TabsTrigger>
              <TabsTrigger value="companion" className="py-3">
                <Users className="w-4 h-4 mr-2" />
                Companions
              </TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(listTypes).map(([type, config]) => (
            <TabsContent key={type} value={type} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {config.icon}
                    {config.name}
                  </CardTitle>
                  <p className="text-gray-500">{config.description}</p>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Category Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 block">
                      Select {config.name.toLowerCase()} type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {config.categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedCategory === category.id 
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50" 
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-2xl mb-2 block">{category.icon}</span>
                          <span className="font-medium block">{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedCategory && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Edit Items for {config.categories.find(c => c.id === selectedCategory)?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Add New Item */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-3">
                        <Input
                          placeholder="Item name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemCategories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          className="w-24"
                        />
                        <Button onClick={handleAddItem}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {currentItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Tag className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {itemCategories.find(cat => cat.value === item.category)?.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  × {item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}

                      {currentItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No items added yet. Add some items to your list.
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    {currentItems.length > 0 && (
                      <div className="flex justify-end">
                        <Button onClick={handleSaveList} className="bg-blue-600 hover:bg-blue-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save List
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
