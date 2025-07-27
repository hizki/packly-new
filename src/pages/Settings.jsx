
import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Bell, Sun, Thermometer, Loader2, LogOut } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  const handleSettingChange = async (newSettings) => {
    try {
      await User.updateMyUserData({ settings: newSettings });
      setSettings(newSettings);
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved"
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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      
      if (user.settings) {
        // Merge loaded settings with defaults to ensure all required properties exist
        const defaultSettings = {
          notifications: true,
          weather_sensitivity: {
            cold_threshold: 15,
            hot_threshold: 25
          },
          minimal_mode: false
        };
        
        const mergedSettings = {
          ...defaultSettings,
          ...user.settings,
          weather_sensitivity: {
            ...defaultSettings.weather_sensitivity,
            ...user.settings.weather_sensitivity
          }
        };
        setSettings(mergedSettings);
      }
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



  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
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
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>

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
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, notifications: checked };
                  handleSettingChange(newSettings);
                }}
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
                onValueChange={([value]) => {
                  const newSettings = {
                    ...settings,
                    weather_sensitivity: {
                      ...settings.weather_sensitivity,
                      cold_threshold: value
                    }
                  };
                  handleSettingChange(newSettings);
                }}
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
                onValueChange={([value]) => {
                  const newSettings = {
                    ...settings,
                    weather_sensitivity: {
                      ...settings.weather_sensitivity,
                      hot_threshold: value
                    }
                  };
                  handleSettingChange(newSettings);
                }}
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
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, minimal_mode: checked };
                  handleSettingChange(newSettings);
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Show fewer suggestions and simpler interface
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Delete Account</CardTitle>
            <CardDescription className="text-red-500">
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end">
              <Button 
                variant="destructive"
                onClick={() => setDeleteAccountDialogOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteAccountDialog 
          open={deleteAccountDialogOpen} 
          onOpenChange={setDeleteAccountDialogOpen}
        />
      </div>
    </div>
  );
}
