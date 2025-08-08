import { useState, useEffect } from 'react';
import { List, ListType, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit3, Trash2, ArrowLeft, Activity, Home, Users, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CustomListForm from '@/components/lists/CustomListForm';
import { toast } from '@/components/ui/use-toast';
import LottieSpinner from '@/components/ui/lottie-spinner';

export default function ListManagerPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('activity');
  const [lists, setLists] = useState({
    activity: [],
    accommodation: [],
    companion: [],
  });
  const [listTypes, setListTypes] = useState({
    activity: { name: 'Activities', description: 'Items needed for specific activities', icon: <Activity className="w-5 h-5" />, categories: [] },
    accommodation: { name: 'Accommodation', description: "Items based on where you're staying", icon: <Home className="w-5 h-5" />, categories: [] },
    companion: { name: 'Travel Companions', description: "Items depending on who you're traveling with", icon: <Users className="w-5 h-5" />, categories: [] },
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  // Escape key navigation
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape') {
        navigate(createPageUrl('Home'));
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [navigate]);

  const loadLists = async () => {
    setLoading(true);
    try {
      // Load dynamic list types from database
      const activityTypes = await ListType.getByTypeGroup('activity');
      const accommodationTypes = await ListType.getByTypeGroup('accommodation');
      const companionTypes = await ListType.getByTypeGroup('companion');

      // Update list types with dynamic data
      setListTypes({
        activity: {
          name: 'Activities',
          description: 'Items needed for specific activities',
          icon: <Activity className="w-5 h-5" />,
          categories: activityTypes.map(type => ({
            id: type.list_name,
            label: type.display_name,
            icon: type.icon,
          })),
        },
        accommodation: {
          name: 'Accommodation',
          description: "Items based on where you're staying",
          icon: <Home className="w-5 h-5" />,
          categories: accommodationTypes.map(type => ({
            id: type.list_name,
            label: type.display_name,
            icon: type.icon,
          })),
        },
        companion: {
          name: 'Travel Companions',
          description: "Items depending on who you're traveling with",
          icon: <Users className="w-5 h-5" />,
          categories: companionTypes.map(type => ({
            id: type.list_name,
            label: type.display_name,
            icon: type.icon,
          })),
        },
      });

      const userLists = await List.findMany();
      setLists({
        activity: userLists.filter(list => list.list_type === 'activity'),
        accommodation: userLists.filter(list => list.list_type === 'accommodation'),
        companion: userLists.filter(list => list.list_type === 'companion'),
      });
    } catch (error) {
      console.error('Error loading lists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lists',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomList = async listData => {
    try {
      const user = await User.me();
      await List.create({
        ...listData,
        owner_id: user.id,
      });
      setShowCustomForm(false);
      loadLists();
      toast({
        title: 'Success',
        description: 'Custom list created successfully',
      });
    } catch (error) {
      console.error('Error creating custom list:', error);
      toast({
        title: 'Error',
        description: 'Failed to create custom list',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteList = async listId => {
    try {
      await List.delete(listId);
      loadLists();
      toast({
        title: 'Success',
        description: 'List deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete list',
        variant: 'destructive',
      });
    }
  };

  const handleEditList = list => {
    navigate(createPageUrl(`ListEditor?type=${list.list_type}&list=${list.list_name}`));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <LottieSpinner
          size={120}
          color="#3b82f6"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl('Home'))}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Your Lists</h1>
                <p className="text-muted-foreground">Manage and customize your packing lists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs Interface */}
        <Tabs value={activeType} onValueChange={setActiveType} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full p-1 rounded-lg h-auto">
            <TabsTrigger 
              value="activity" 
              className="py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Activities</span>
              <span className="sm:hidden">Activity</span>
            </TabsTrigger>
            <TabsTrigger 
              value="accommodation" 
              className="py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Accommodation</span>
              <span className="sm:hidden">Stay</span>
            </TabsTrigger>
            <TabsTrigger 
              value="companion" 
              className="py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center"
            >
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Companions</span>
              <span className="sm:hidden">Companions</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(listTypes).map(([type, config]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {/* Concise explainer (no duplicate title) */}
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Lists are reusable building blocks. When you set up a trip, items from your
                  selected {config.name.toLowerCase()} are pulled into your packing list. Keep them
                  short and focused; you can always adjust per trip.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {lists[type].map(list => (
                     <Card key={list.id} className="hover:shadow-md transition-shadow">
                       <CardHeader className="pb-3">
                         <div className="flex items-start justify-between">
                           <div className="flex items-center gap-2">
                             <span className="text-xl">{list.icon || '📋'}</span>
                             <div>
                               <CardTitle className="text-base">{list.name}</CardTitle>
                             </div>
                           </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditList(list)}
                            className="p-1 h-auto"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteList(list.id)}
                            className="p-1 h-auto text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {list.items?.length || 0} items
                      </p>
                                         </CardContent>
                   </Card>
                 ))}

                {lists[type].length === 0 && (
                   <div className="col-span-full text-center py-12 text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No {config.name.toLowerCase()} lists yet</p>
                      <p className="text-sm mb-4">Create your first custom list to get started</p>
                      <Button
                        onClick={() => {
                          setActiveType(type);
                          setShowCustomForm(true);
                        }}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                  </div>
                )}
              </div>

              {/* Bottom Add button */}
              {lists[type].length > 0 && (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setActiveType(type);
                      setShowCustomForm(true);
                    }}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Custom List Form */}
        {showCustomForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <CustomListForm
              listType={activeType}
              onCancel={() => setShowCustomForm(false)}
              onSave={handleCreateCustomList}
            />
          </div>
        )}
      </div>
    </div>
  );
}
