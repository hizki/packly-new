import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PackingList } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, differenceInDays } from 'date-fns';
import {
  ArrowLeft,
  CloudRain,
  Sun,
  Cloud,
  Star,
  MapPin,
  Plus,
  Edit,
  Save,
  Plane,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LottieSpinner from '../components/ui/lottie-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/api/entities';
import { toast } from '@/components/ui/use-toast';
import AnimatedListItem from '../components/list/AnimatedListItem';
import { Input } from '@/components/ui/input';
import ConfettiEffect from '../components/animated/ConfettiEffect';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import FlightDetailsDialog from '../components/flights/FlightDetailsDialog';
import FlightDetailsCard from '../components/flights/FlightDetailsCard';
import { TipList } from '@/api/entities';
import TipListSection from '../components/tips/TipListSection';
import { generateEmojiForItem } from '@/utils/emojiGenerator';

export default function ListDetailPage() {
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'additional',
    quantity: 1,
    is_packed: false,
    weather_dependent: false,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlightDialog, setShowFlightDialog] = useState(false);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [dayBeforeTips, setDayBeforeTips] = useState([]);
  const [beforeLeavingTips, setBeforeLeavingTips] = useState([]);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [editingTripName, setEditingTripName] = useState(false);
  const [tempTripName, setTempTripName] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const categoryCompletionRef = useRef({});
  const tripNameInputRef = useRef(null);
  const [newInlineItem, setNewInlineItem] = useState({ name: '', category: 'additional', quantity: 1, is_packed: false, weather_dependent: false });
  const [inlineCategoryTarget, setInlineCategoryTarget] = useState(null);
  const [selectedItemIndices, setSelectedItemIndices] = useState(new Set());

  // Track pending items to prevent race conditions
  const [pendingItemIds, setPendingItemIds] = useState(new Set());

  const packedCount = useMemo(() => (list?.items || []).filter(i => i.is_packed).length, [list]);
  const totalCount = useMemo(() => (list?.items || []).length ?? 0, [list]);
  const packedPct = useMemo(() => (totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0), [packedCount, totalCount]);

  const resetSelection = useCallback(() => setSelectedItemIndices(new Set()), []);
  const toggleSelectIndex = useCallback((index) => {
    setSelectedItemIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }, []);

  const selectAllInCategory = useCallback((category) => {
    if (!list?.items) return;
    const indices = list.items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.category === category)
      .map(({ idx }) => idx);
    setSelectedItemIndices(new Set(indices));
  }, [list]);

  const bulkUpdatePacked = useCallback(async (packed) => {
    if (!list || selectedItemIndices.size === 0) return;
    const updated = (list.items || []).map((item, idx) => selectedItemIndices.has(idx) ? { ...item, is_packed: packed } : item);
    try {
      await PackingList.update(list.id, { items: updated });
      setList({ ...list, items: updated });
      resetSelection();
    } catch (e) {
      toast({ title: 'Error', description: 'Bulk update failed', variant: 'destructive' });
    }
  }, [list, selectedItemIndices, resetSelection]);

  const bulkDelete = useCallback(async () => {
    if (!list || selectedItemIndices.size === 0) return;
    const updated = (list.items || []).filter((_, idx) => !selectedItemIndices.has(idx));
    try {
      await PackingList.update(list.id, { items: updated });
      setList({ ...list, items: updated });
      resetSelection();
    } catch (e) {
      toast({ title: 'Error', description: 'Bulk delete failed', variant: 'destructive' });
    }
  }, [list, selectedItemIndices, resetSelection]);

  const handleReorderCategory = useCallback(
    async (category, newOrder) => {
      if (!list?.items) return;
      const reorderedCategoryItems = newOrder;
      const updatedItems = [];
      // Rebuild items array by replacing the slice of this category with newOrder
      const original = list.items;
      const categoryQueue = [...reorderedCategoryItems];
      for (const item of original) {
        if (item.category === category) {
          updatedItems.push(categoryQueue.shift() || item);
        } else {
          updatedItems.push(item);
        }
      }
      setList({ ...list, items: updatedItems });
      try {
        await PackingList.update(list.id, { items: updatedItems });
      } catch (e) {
        console.warn('Failed to persist reorder', e);
      }
    },
    [list],
  );

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (id) {
        await loadList(id);
      }
      await loadTipLists();
    };

    loadData();
  }, []);

  // Focus input when editing trip name
  useEffect(() => {
    if (editingTripName && tripNameInputRef.current) {
      tripNameInputRef.current.focus();
      tripNameInputRef.current.select();
    }
  }, [editingTripName]);

  // Escape key navigation
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape') {
        if (editingTripName) {
          setEditingTripName(false);
          setTempTripName('');
        } else {
          navigate(createPageUrl('Trips'));
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [navigate, editingTripName]);

  const loadTipLists = async () => {
    try {
      const user = await User.me();
      const lists = await TipList.filter({ owner_id: user.id });

      const dayBefore = lists.find(list => list.list_type === 'day_before');
      const beforeLeaving = lists.find(list => list.list_type === 'before_leaving');

      if (dayBefore) setDayBeforeTips(dayBefore.tips || []);
      if (beforeLeaving) setBeforeLeavingTips(beforeLeaving.tips || []);
    } catch (error) {
      console.error('Error loading tip lists:', error);
    }
  };

  const loadList = async id => {
    setLoading(true);
    try {
      const fetchedList = await PackingList.filter({ id });
      if (fetchedList && fetchedList.length > 0) {
        const list = fetchedList[0];

        const user = await User.me();
        if (list.owner_id !== user.id) {
          toast({
            title: 'Access Denied',
            description: "You don't have permission to view this list",
            variant: 'destructive',
          });
          navigate(createPageUrl('Lists'));
          return;
        }

        // Generate emojis for items that don't have them
        const itemsWithEmojis = await Promise.all(
          (list.items || []).map(async item => {
            if (!item.emoji) {
              const emoji = await generateEmojiForItem(
                item.name, 
                item.category, 
                list.activities || [],
              );
              return { ...item, emoji };
            }
            return item;
          }),
        );

        // If any items were missing emojis, update the list
        const missingEmojiCount = itemsWithEmojis.filter(
          (item, index) => item.emoji !== list.items[index]?.emoji,
        ).length;
        
        if (missingEmojiCount > 0) {
          const updatedList = { ...list, items: itemsWithEmojis };
          setList(updatedList);
          
          // Update in database
          try {
            await PackingList.update(list.id, { items: itemsWithEmojis });
            console.log(`✨ Generated ${missingEmojiCount} emojis for existing items`);
          } catch (error) {
            console.warn('Failed to update emojis in database:', error);
          }
        } else {
          setList(list);
        }
        
        // Initialize collapsed state for complete categories
        initializeCollapsedState(list);
      } else {
        throw new Error('List not found');
      }
    } catch (error) {
      console.error('Error loading list:', error);
      toast({
        title: 'Error',
        description: 'Failed to load packing list',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeCollapsedState = list => {
    if (!list.items) return;

    const categories = ['clothing', 'toiletries', 'tech', 'gear', 'essentials', 'additional'];
    const initialCollapsed = new Set();

    categories.forEach(category => {
      const categoryItems = list.items.filter(item => item.category === category);
      const isComplete = categoryItems.length > 0 && categoryItems.every(item => item.is_packed);

      if (isComplete) {
        initialCollapsed.add(category);
      }

      categoryCompletionRef.current[category] = isComplete;
    });

    setCollapsedCategories(initialCollapsed);
  };

  // Improved toggle with proper state management
  const toggleItemPacked = async itemIndex => {
    if (!list) return;

    const itemId = `${list.id}-${itemIndex}`;

    // Prevent double-clicks on the same item
    if (pendingItemIds.has(itemId)) return;

    // Mark item as pending
    setPendingItemIds(prev => new Set([...prev, itemId]));

    const updatedItems = [...list.items];
    const newPackedState = !updatedItems[itemIndex].is_packed;

    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      is_packed: newPackedState,
    };

    try {
      // Update API first, then update UI
      await PackingList.update(list.id, { items: updatedItems });

      // Only update UI after successful API call
      setList({
        ...list,
        items: updatedItems,
      });

      // Check category completion after successful update
      checkCategoryCompletion(updatedItems, updatedItems[itemIndex].category);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    } finally {
      // Remove item from pending set
      setPendingItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const checkCategoryCompletion = (items, category) => {
    const categoryItems = items.filter(item => item.category === category);
    const allPacked = categoryItems.length > 0 && categoryItems.every(item => item.is_packed);

    if (allPacked && categoryItems.length > 0 && !categoryCompletionRef.current[category]) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      // Auto-collapse the completed category
      setCollapsedCategories(prev => new Set([...prev, category]));
    }

    // If category becomes incomplete, auto-expand it
    if (!allPacked && categoryCompletionRef.current[category]) {
      setCollapsedCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(category);
        return newSet;
      });
    }

    categoryCompletionRef.current[category] = allPacked;
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an item name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const emoji = await generateEmojiForItem(newItem.name, newItem.category, list.activities);
      const itemWithEmoji = {
        ...newItem,
        emoji,
      };
      const updatedItems = [...(list.items || []), itemWithEmoji];

      await PackingList.update(list.id, { items: updatedItems });

      setList({
        ...list,
        items: updatedItems,
      });

      setNewItem({
        name: '',
        category: 'additional',
        quantity: 1,
        is_packed: false,
        weather_dependent: false,
      });

      setShowAddItemDialog(false);

      toast({
        title: 'Item added',
        description: `"${newItem.name}" has been added to your list`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
    }
  };

  const handleInlineAdd = async category => {
    if (!newInlineItem.name.trim()) return;
    try {
      const emoji = await generateEmojiForItem(newInlineItem.name, category, list.activities);
      const itemWithEmoji = { ...newInlineItem, category, emoji };
      const updatedItems = [...(list.items || []), itemWithEmoji];
      await PackingList.update(list.id, { items: updatedItems });
      setList({ ...list, items: updatedItems });
      setNewInlineItem({ name: '', category: 'additional', quantity: 1, is_packed: false, weather_dependent: false });
      setInlineCategoryTarget(null);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
    }
  };

  const handleUpdateItemQuantity = async (itemIndex, newQuantity) => {
    if (!list) return;

    const updatedItems = [...list.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: parseInt(newQuantity) || 1,
    };

    try {
      await PackingList.update(list.id, { items: updatedItems });
      setList({
        ...list,
        items: updatedItems,
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  const handleUpdateItemEmoji = async (itemIndex, newEmoji) => {
    if (!list) return;

    const updatedItems = [...list.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      emoji: newEmoji,
    };

    try {
      await PackingList.update(list.id, { items: updatedItems });
      setList({
        ...list,
        items: updatedItems,
      });
    } catch (error) {
      console.error('Error updating item emoji:', error);
    }
  };

  const handleRemoveItem = async itemIndex => {
    if (!list) return;

    try {
      const updatedItems = [...list.items];
      updatedItems.splice(itemIndex, 1);

      await PackingList.update(list.id, { items: updatedItems });

      setList({
        ...list,
        items: updatedItems,
      });

      toast({
        title: 'Item removed',
        description: 'Item has been removed from your list',
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const handleAddFlightDetails = destinationIndex => {
    setCurrentDestinationIndex(destinationIndex);
    setShowFlightDialog(true);
  };

  const handleTripNameClick = () => {
    const currentName = list?.name || list?.destinations?.[0]?.location || 'Trip';
    setTempTripName(currentName);
    setEditingTripName(true);
  };

  const handleTripNameSave = async () => {
    if (!tempTripName.trim() || !list) {
      setEditingTripName(false);
      setTempTripName('');
      return;
    }

    try {
      await PackingList.update(list.id, { name: tempTripName.trim() });
      setList({ ...list, name: tempTripName.trim() });
      setEditingTripName(false);
      setTempTripName('');

      toast({
        title: 'Trip name updated',
        description: 'Your trip name has been saved successfully',
      });
    } catch (error) {
      console.error('Error updating trip name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trip name',
        variant: 'destructive',
      });
    }
  };

  const handleTripNameKeyDown = e => {
    if (e.key === 'Enter') {
      handleTripNameSave();
    } else if (e.key === 'Escape') {
      setEditingTripName(false);
      setTempTripName('');
    }
  };

  const handleFlightSelected = async flightDetails => {
    if (!list) return;

    try {
      const updatedDestinations = [...list.destinations];
      updatedDestinations[currentDestinationIndex] = {
        ...updatedDestinations[currentDestinationIndex],
        flight: flightDetails,
      };

      await PackingList.update(list.id, { destinations: updatedDestinations });

      setList({
        ...list,
        destinations: updatedDestinations,
      });

      toast({
        title: 'Flight details added',
        description: 'Your flight information has been saved to the trip',
      });
    } catch (error) {
      console.error('Error adding flight details:', error);
      toast({
        title: 'Error',
        description: 'Failed to add flight details',
        variant: 'destructive',
      });
    }
  };

  const getDateRange = () => {
    if (!list) return { start: new Date(), end: new Date() };
    if (list.destinations && list.destinations.length > 0) {
      // Calculate full trip span: start of first destination to end of last destination
      const sortedDestinations = [...list.destinations].sort(
        (a, b) => new Date(a.start_date) - new Date(b.start_date),
      );
      return {
        start: new Date(sortedDestinations[0].start_date),
        end: new Date(sortedDestinations[sortedDestinations.length - 1].end_date),
      };
    }
    return {
      start: new Date(list.start_date),
      end: new Date(list.end_date),
    };
  };

  const getWeatherIcon = conditions => {
    if (!conditions) return <Cloud className="w-5 h-5 text-gray-400" />;

    switch (conditions.toLowerCase()) {
      case 'clear':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="w-5 h-5 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      default:
        return <Cloud className="w-5 h-5 text-gray-400" />;
    }
  };

  const toggleFavorite = async () => {
    if (!list) return;

    try {
      await PackingList.update(list.id, { is_favorite: !list.is_favorite });
      setList({
        ...list,
        is_favorite: !list.is_favorite,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderTipLists = () => {
    if (!list || !list.destinations || list.destinations.length === 0) return null;

    const firstDestination = list.destinations[0];
    const startDate = new Date(firstDestination.start_date);
    const today = new Date();
    const daysUntilTrip = differenceInDays(startDate, today);

    return (
      <>
        {daysUntilTrip <= 3 && daysUntilTrip > 0 && (
          <TipListSection
            title="Day Before Departure Tips"
            tips={dayBeforeTips}
            collapsed={false}
          />
        )}
        {daysUntilTrip === 0 && (
          <TipListSection
            title="Before Leaving Home Tips"
            tips={beforeLeavingTips}
            collapsed={false}
          />
        )}
      </>
    );
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates not set';
    const start = format(new Date(startDate), 'MMM d');
    const end = format(new Date(endDate), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };

  const toggleCategoryCollapse = category => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const isCategoryComplete = category => {
    if (!list.items) return false;
    const categoryItems = list.items.filter(item => item.category === category);
    return categoryItems.length > 0 && categoryItems.every(item => item.is_packed);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <Skeleton className="h-12" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">List not found</h2>
        <Button onClick={() => navigate(createPageUrl('Lists'))}>Back to Lists</Button>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <ConfettiEffect active={showConfetti} />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Trips'))}
              className="p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              {editingTripName ? (
                <input
                  ref={tripNameInputRef}
                  value={tempTripName}
                  onChange={e => setTempTripName(e.target.value)}
                  onKeyDown={handleTripNameKeyDown}
                  onBlur={handleTripNameSave}
                  className="text-2xl font-bold cursor-pointer"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0',
                    margin: '0',
                    width: `${Math.max(300, tempTripName.length * 14)}px`,
                    maxWidth: '100vw',
                  }}
                />
              ) : (
                <h1
                  className="text-2xl font-bold line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleTripNameClick}
                  title="Click to edit trip name"
                >
                  {list?.name || list?.destinations?.[0]?.location || 'Trip'}
                </h1>
              )}
              {list?.destinations?.[0] && (
                <p className="text-muted-foreground">
                  {formatDateRange(getDateRange().start, getDateRange().end)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={list.is_favorite ? 'text-yellow-400' : 'text-gray-400'}
              onClick={toggleFavorite}
            >
              <Star className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Done
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Trip Details Toggle Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowTripDetails(!showTripDetails)}
            className="w-full justify-center"
          >
            {showTripDetails ? 'Hide Trip Details' : 'Show Trip Details'}
          </Button>
        </div>

        {/* Collapsible Trip Details Card */}
        {showTripDetails && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                {list.destinations ? (
                  list.destinations.map((destination, index) => (
                    <div
                      key={index}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <h3 className="font-medium">{destination.location}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {destination.start_date && destination.end_date ? (
                                <>
                                  {format(new Date(destination.start_date), 'MMM d, yyyy')} —{' '}
                                  {format(new Date(destination.end_date), 'MMM d, yyyy')}
                                </>
                              ) : (
                                'Dates not set'
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!destination.flight && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddFlightDetails(index)}
                           className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Plane className="w-4 h-4 mr-2" />
                              Add Flight Details
                            </Button>
                          )}
                          {destination.weather && (
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm">
                              {getWeatherIcon(destination.weather.conditions)}
                              <span>
                                {destination.weather.min_temp}° - {destination.weather.max_temp}°C
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {destination.flight && (
                        <FlightDetailsCard
                          flight={destination.flight}
                          destinationDate={destination.start_date}
                          onEditFlight={() => handleAddFlightDetails(index)}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{list.destination}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(getDateRange().start, 'MMM d')} -{' '}
                        {format(getDateRange().end, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {Array.isArray(list.accommodation) && list.accommodation.length > 0 && (
                    list.accommodation.map(acc => (
                      <Badge
                        key={acc}
                        variant="outline"
                        className="bg-gray-50"
                      >
                        {String(acc).replace(/_/g, ' ')}
                      </Badge>
                    ))
                  )}

                  {list.activities &&
                    list.activities.map(activity => (
                      <Badge
                        key={activity}
                        className="bg-blue-100 text-blue-800"
                      >
                        {activity}
                      </Badge>
                    ))}

                  {list.companions &&
                    list.companions.map(companion => (
                      <Badge
                        key={companion}
                        className="bg-green-100 text-green-800"
                      >
                        {companion}
                      </Badge>
                    ))}

                  {list.amenities &&
                    list.amenities.map(amenity => (
                      <Badge
                        key={amenity}
                        variant="outline"
                        className="bg-yellow-50"
                      >
                        {amenity}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Packing Progress</h3>

              <Dialog
                open={showAddItemDialog}
                onOpenChange={setShowAddItemDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="Enter item name"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-category">Category</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={value => setNewItem({ ...newItem, category: value })}
                        >
                          <SelectTrigger id="item-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="toiletries">Toiletries</SelectItem>
                            <SelectItem value="tech">Tech</SelectItem>
                            <SelectItem value="gear">Gear</SelectItem>
                            <SelectItem value="essentials">Essentials</SelectItem>
                            <SelectItem value="additional">Additional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-quantity">Quantity</Label>
                        <Input
                          id="item-quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={e =>
                            setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="item-weather"
                        checked={newItem.weather_dependent}
                        onCheckedChange={checked =>
                          setNewItem({ ...newItem, weather_dependent: checked })
                        }
                      />
                      <Label htmlFor="item-weather">Weather dependent item</Label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAddItem}>Add to List</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="w-full h-2.5 rounded-full bg-muted">
              <div className="h-2.5 rounded-full bg-primary transition-[width] duration-200" style={{ width: `${packedPct}%` }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{packedCount} of {totalCount} items packed ({packedPct}%)</p>
          </div>

          {['clothing', 'toiletries', 'tech', 'gear', 'essentials', 'additional'].map(category => {
            const categoryItems = list.items
              ? list.items.filter(item => item.category === category)
              : [];
            if (categoryItems.length === 0) return null;

            const isComplete = isCategoryComplete(category);
            const isCollapsed = collapsedCategories.has(category);

            return (
              <Card key={category}>
                <CardHeader className="pb-2 pt-2 sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
                  <div
                    className="flex items-center justify-between cursor-pointer rounded-md p-1 -m-1"
                    onClick={() => toggleCategoryCollapse(category)}
                  >
                    <CardTitle className="text-lg capitalize flex items-center gap-2">
                      {category}
                      <Badge variant="secondary">{categoryItems.length}</Badge>
                      {isComplete && <span className="ml-1 text-green-500 text-xs">Complete</span>}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isEditMode && (
                        <div className="hidden sm:flex gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); selectAllInCategory(category); }}>Select all</Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); resetSelection(); }}>Clear</Button>
                        </div>
                      )}
                      <div className="text-muted-foreground">
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                  {isEditMode && selectedItemIndices.size > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{selectedItemIndices.size} selected</span>
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); bulkUpdatePacked(true); }}>Pack</Button>
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); bulkUpdatePacked(false); }}>Unpack</Button>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); bulkDelete(); }}>Delete</Button>
                    </div>
                  )}
                </CardHeader>
                {!isCollapsed && (
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      <AnimatePresence initial={false}>
                        <Reorder.Group
                          axis="y"
                          values={categoryItems}
                          onReorder={newOrder => handleReorderCategory(category, newOrder)}
                        >
                          {categoryItems.map((item, index) => {
                            const itemIndex = list.items.findIndex(i => i === item);
                            const isSelected = selectedItemIndices.has(itemIndex);
                            return (
                              <Reorder.Item key={`${item.name}-${index}`} value={item}>
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                                  <AnimatedListItem
                                    item={item}
                                    onToggle={() => toggleItemPacked(itemIndex)}
                                    onUpdateQuantity={quantity => handleUpdateItemQuantity(itemIndex, quantity)}
                                    onUpdateEmoji={emoji => handleUpdateItemEmoji(itemIndex, emoji)}
                                    onDelete={isEditMode ? () => handleRemoveItem(itemIndex) : undefined}
                                    isEditMode={isEditMode}
                                    isSelected={isSelected}
                                    onSelectToggle={() => toggleSelectIndex(itemIndex)}
                                    isPending={pendingItemIds.has(`${list.id}-${itemIndex}`)}
                                  />
                                </motion.div>
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>
                      </AnimatePresence>
                    </div>
                    {/* Inline Add Row */}
                    <div className="flex items-center gap-2 pt-3">
                      <Input
                        placeholder={`Add ${category} item…`}
                        value={inlineCategoryTarget === category ? newInlineItem.name : ''}
                        onFocus={() => setInlineCategoryTarget(category)}
                        onChange={e => { setInlineCategoryTarget(category); setNewInlineItem(prev => ({ ...prev, name: e.target.value })); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleInlineAdd(category);
                          if (e.key === 'Escape') { setInlineCategoryTarget(null); setNewInlineItem(prev => ({ ...prev, name: '' })); }
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleInlineAdd(category)} disabled={inlineCategoryTarget !== category || !newInlineItem.name.trim()}>
                        Add
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
        {renderTipLists()}
      </div>

      <FlightDetailsDialog
        open={showFlightDialog}
        onOpenChange={setShowFlightDialog}
        destination={list?.destinations?.[currentDestinationIndex]}
        startDate={list?.destinations?.[currentDestinationIndex]?.start_date}
        onFlightSelected={handleFlightSelected}
      />
    </div>
  );
}
