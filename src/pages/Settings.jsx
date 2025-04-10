
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { BaseList } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Bell, Sun, Thermometer, Plus, Trash2, Loader2 } from "lucide-react";
import BaseListEditor from "../components/settings/BaseListEditor";
import DeleteAccountDialog from "../components/settings/DeleteAccountDialog";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    weather_sensitivity: {
      cold_threshold: 15,
      hot_threshold: 25
    },
    minimal_mode: false
  });
  const [activeTab, setActiveTab] = useState("activities");
  const [baseLists, setBaseLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      
      if (user.settings) {
        setSettings(user.settings);
      }
      
      if (!user.has_initialized_base_lists) {
        await initializeDefaultBaseLists(user.id);
      }
      
      await loadBaseLists();
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultBaseLists = async (userId) => {
    try {
      const defaultItems = {
        beach: [
          { name: "Swimsuit", category: "clothing", quantity: 2 },
          { name: "Beach towel", category: "gear", quantity: 1 },
          { name: "Sunscreen", category: "toiletries", quantity: 1 },
          { name: "Sunglasses", category: "essentials", quantity: 1 }
        ],
        camping: [
          { name: "Tent", category: "gear", quantity: 1 },
          { name: "Sleeping bag", category: "gear", quantity: 1 },
          { name: "Flashlight", category: "gear", quantity: 1 },
          { name: "First aid kit", category: "essentials", quantity: 1 }
        ],
        hiking: [
          { name: "Hiking boots", category: "clothing", quantity: 1 },
          { name: "Water bottle", category: "gear", quantity: 1 },
          { name: "Bug spray", category: "toiletries", quantity: 1 }
        ],
        business: [
          { name: "Suit", category: "clothing", quantity: 1 },
          { name: "Dress shoes", category: "clothing", quantity: 1 },
          { name: "Laptop", category: "tech", quantity: 1 },
          { name: "Business cards", category: "essentials", quantity: 1 }
        ]
      };
      
      await Promise.all([
        BaseList.create({
          list_type: "activity", 
          category: "beach", 
          items: defaultItems.beach,
          owner_id: userId,
          is_default: true
        }),
        BaseList.create({
          list_type: "activity", 
          category: "camping", 
          items: defaultItems.camping,
          owner_id: userId,
          is_default: true
        }),
        BaseList.create({
          list_type: "activity", 
          category: "hiking", 
          items: defaultItems.hiking,
          owner_id: userId,
          is_default: true
        }),
        BaseList.create({
          list_type: "activity", 
          category: "business", 
          items: defaultItems.business,
          owner_id: userId,
          is_default: true
        })
      ]);
      
      await Promise.all([
        BaseList.create({
          list_type: "accommodation",
          category: "hotel",
          items: [
            { name: "Hotel address", category: "essentials", quantity: 1 },
            { name: "Booking confirmation", category: "essentials", quantity: 1 }
          ],
          owner_id: userId,
          is_default: true
        }),
        BaseList.create({
          list_type: "accommodation",
          category: "camping",
          items: [
            { name: "Camping permit", category: "essentials", quantity: 1 },
            { name: "Site reservation", category: "essentials", quantity: 1 }
          ],
          owner_id: userId,
          is_default: true
        })
      ]);
      
      await User.updateMyUserData({ has_initialized_base_lists: true });
      
      toast({
        title: "Default lists created",
        description: "Your account has been set up with default packing lists"
      });
    } catch (error) {
      console.error("Error initializing default base lists:", error);
    }
  };

  const loadBaseLists = async () => {
    try {
      const user = await User.me();
      const lists = await BaseList.filter({ owner_id: user.id });
      setBaseLists(lists);
    } catch (error) {
      console.error("Error loading base lists:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await User.updateMyUserData({ settings });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable notifications</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Weather Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Cold threshold (°C)</Label>
              <Slider
                value={[settings.weather_sensitivity.cold_threshold]}
                min={0}
                max={20}
                step={1}
                onValueChange={([value]) => 
                  setSettings(prev => ({
                    ...prev,
                    weather_sensitivity: {
                      ...prev.weather_sensitivity,
                      cold_threshold: value
                    }
                  }))
                }
              />
              <p className="text-sm text-gray-500">
                Items will be added for cold weather below {settings.weather_sensitivity.cold_threshold}°C
              </p>
            </div>

            <div className="space-y-4">
              <Label>Hot threshold (°C)</Label>
              <Slider
                value={[settings.weather_sensitivity.hot_threshold]}
                min={20}
                max={40}
                step={1}
                onValueChange={([value]) => 
                  setSettings(prev => ({
                    ...prev,
                    weather_sensitivity: {
                      ...prev.weather_sensitivity,
                      hot_threshold: value
                    }
                  }))
                }
              />
              <p className="text-sm text-gray-500">
                Items will be added for hot weather above {settings.weather_sensitivity.hot_threshold}°C
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Display Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="minimal_mode">Minimal mode</Label>
              <Switch
                id="minimal_mode"
                checked={settings.minimal_mode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, minimal_mode: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Show fewer suggestions and simpler interface
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Base Packing Lists</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full grid grid-cols-3">
                <TabsTrigger value="activities" className="text-xs sm:text-sm">Activities</TabsTrigger>
                <TabsTrigger value="accommodation" className="text-xs sm:text-sm">Accommodation</TabsTrigger>
                <TabsTrigger value="companions" className="text-xs sm:text-sm">Companions</TabsTrigger>
              </TabsList>

              {activeTab === "activities" && (
                <BaseListEditor 
                  lists={baseLists.filter(l => l.list_type === "activity")}
                  listType="activity"
                  categories={["beach", "camping", "climbing", "hiking", "partying", "business", "sightseeing"]}
                  onUpdate={loadBaseLists}
                />
              )}

              {activeTab === "accommodation" && (
                <BaseListEditor 
                  lists={baseLists.filter(l => l.list_type === "accommodation")}
                  listType="accommodation"
                  categories={["hotel", "camping", "glamping", "couch_surfing", "airbnb"]}
                  onUpdate={loadBaseLists}
                />
              )}

              {activeTab === "companions" && (
                <BaseListEditor 
                  lists={baseLists.filter(l => l.list_type === "companion")}
                  listType="companion"
                  categories={["alone", "spouse", "friends", "family"]}
                  onUpdate={loadBaseLists}
                />
              )}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">Delete Account</h3>
                  <p className="text-sm text-red-600">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => setDeleteAccountDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <DeleteAccountDialog 
          open={deleteAccountDialogOpen} 
          onOpenChange={setDeleteAccountDialogOpen}
        />

        <div className="flex justify-end">
          <Button 
            onClick={saveSettings}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
