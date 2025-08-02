import React, { useState, useEffect } from 'react';
import { PackingList } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, Search, ListChecks, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LottieSpinner from '../components/ui/lottie-spinner';
import { toast } from '@/components/ui/use-toast';

export default function ListsPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndLists();
  }, []);

  const loadUserAndLists = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      await loadLists(currentUser.id);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async userId => {
    try {
      // Get only the user's packing lists
      const fetchedLists = await PackingList.filter({ owner_id: userId }, '-created_date');
      setLists(fetchedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const deleteList = async id => {
    try {
      await PackingList.delete(id);
      if (user) {
        loadLists(user.id);
      }
      toast({
        title: 'List deleted',
        description: 'Your packing list has been deleted',
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the list',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async list => {
    try {
      await PackingList.update(list.id, {
        ...list,
        is_favorite: !list.is_favorite,
      });
      if (user) {
        loadLists(user.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredLists = lists.filter(list => {
    const matchesName = list.name
      ? list.name.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    const matchesDestination =
      list.destinations && list.destinations.length > 0 && list.destinations[0].location
        ? list.destinations[0].location.toLowerCase().includes(searchQuery.toLowerCase())
        : list.destination
          ? list.destination.toLowerCase().includes(searchQuery.toLowerCase())
          : false;

    const matchesSearch = matchesName || matchesDestination;

    const matchesTab = activeTab === 'all' || (activeTab === 'favorites' && list.is_favorite);
    return matchesSearch && matchesTab;
  });

  const getDestinationName = list => {
    if (list.name) {
      return list.name;
    }
    if (list.destinations && list.destinations.length > 0) {
      return list.destinations[0].location;
    }
    return list.destination || 'Unnamed Trip';
  };

  const getDateRange = list => {
    if (list.destinations && list.destinations.length > 0) {
      return {
        start: new Date(list.destinations[0].start_date),
        end: new Date(list.destinations[0].end_date),
      };
    }
    return {
      start: new Date(list.start_date),
      end: new Date(list.end_date),
    };
  };

  const handleViewList = listId => {
    navigate(createPageUrl(`ListDetail?id=${listId}`));
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
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1
            className="text-2xl font-bold"
            onClick={() => navigate(createPageUrl('Home'))}
          >
            My Packing Lists
          </h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search lists..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">All Lists</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredLists.map(list => (
            <Card
              key={list.id}
              className="overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{getDestinationName(list)}</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={list.is_favorite ? 'text-yellow-400' : 'text-gray-400'}
                        onClick={() => toggleFavorite(list)}
                      >
                        <Star className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {format(getDateRange(list).start, 'MMM d')} -{' '}
                      {format(getDateRange(list).end, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteList(list.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {list.activities &&
                      list.activities.map(activity => (
                        <Badge
                          key={activity}
                          variant="secondary"
                        >
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
                        {list.items
                          ? `${list.items.filter(item => item.is_packed).length} / ${list.items.length} items packed`
                          : '0 items'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewList(list.id)}
                    >
                      View List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lists found</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : activeTab === 'favorites'
                    ? "You haven't favorited any lists yet"
                    : 'Start by creating your first packing list'}
              </p>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate(createPageUrl('New'))}
              >
                Create New List
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
