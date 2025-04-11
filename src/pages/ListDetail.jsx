
import React, { useState, useEffect, useRef } from "react";
import { PackingList } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import {
  ArrowLeft,
  CloudRain,
  Thermometer,
  Sun,
  Cloud,
  Star,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  Plane,
  CalendarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LottieSpinner from "../components/ui/lottie-spinner";
import { User } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import AnimatedListItem from "../components/list/AnimatedListItem";
import ConfettiEffect from "../components/animated/ConfettiEffect";
import { motion, AnimatePresence } from "framer-motion";
import FlightDetailsDialog from "../components/flights/FlightDetailsDialog";
import FlightDetailsCard from "../components/flights/FlightDetailsCard";
import { TipList } from '@/api/entities';
import TipListSection from '../components/tips/TipListSection';

export default function ListDetailPage() {
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listId, setListId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "additional",
    quantity: 1,
    is_packed: false,
    weather_dependent: false
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlightDialog, setShowFlightDialog] = useState(false);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [dayBeforeTips, setDayBeforeTips] = useState([]);
  const [beforeLeavingTips, setBeforeLeavingTips] = useState([]);
  const categoryCompletionRef = useRef({});

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      
      if (id) {
        setListId(id);
        await loadList(id);
      }
      await loadTipLists();
    };
    
    loadData();
  }, []);

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

  const loadList = async (id) => {
    setLoading(true);
    try {
      const fetchedList = await PackingList.filter({ id });
      if (fetchedList && fetchedList.length > 0) {
        const list = fetchedList[0];
        
        const user = await User.me();
        if (list.owner_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this list",
            variant: "destructive"
          });
          navigate(createPageUrl("Lists"));
          return;
        }
        
        setList(list);
      } else {
        throw new Error("List not found");
      }
    } catch (error) {
      console.error("Error loading list:", error);
      toast({
        title: "Error",
        description: "Failed to load packing list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemPacked = async (itemIndex) => {
    if (!list) return;
    
    const updatedItems = [...list.items];
    const newPackedState = !updatedItems[itemIndex].is_packed;
    
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      is_packed: newPackedState
    };
    
    const updatedList = {
      ...list,
      items: updatedItems
    };
    
    try {
      await PackingList.update(list.id, { items: updatedItems });
      setList(updatedList);
      
      if (newPackedState) {
        checkCategoryCompletion(updatedItems, updatedItems[itemIndex].category);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };
  
  const checkCategoryCompletion = (items, category) => {
    const categoryItems = items.filter(item => item.category === category);
    const allPacked = categoryItems.length > 0 && categoryItems.every(item => item.is_packed);
    
    if (allPacked && categoryItems.length > 1 && !categoryCompletionRef.current[category]) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    
    categoryCompletionRef.current[category] = allPacked;
  };
  
  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedItems = [...(list.items || []), newItem];
      
      await PackingList.update(list.id, { items: updatedItems });
      
      setList({
        ...list,
        items: updatedItems
      });
      
      setNewItem({
        name: "",
        category: "additional",
        quantity: 1,
        is_packed: false,
        weather_dependent: false
      });
      
      setShowAddItemDialog(false);
      
      toast({
        title: "Item added",
        description: `"${newItem.name}" has been added to your list`
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateItemQuantity = async (itemIndex, newQuantity) => {
    if (!list) return;
    
    const updatedItems = [...list.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: parseInt(newQuantity) || 1
    };
    
    try {
      await PackingList.update(list.id, { items: updatedItems });
      setList({
        ...list,
        items: updatedItems
      });
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };
  
  const handleRemoveItem = async (itemIndex) => {
    if (!list) return;
    
    try {
      const updatedItems = [...list.items];
      updatedItems.splice(itemIndex, 1);
      
      await PackingList.update(list.id, { items: updatedItems });
      
      setList({
        ...list,
        items: updatedItems
      });
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your list"
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const handleAddFlightDetails = (destinationIndex) => {
    setCurrentDestinationIndex(destinationIndex);
    setShowFlightDialog(true);
  };

  const handleFlightSelected = async (flightDetails) => {
    if (!list) return;
    
    try {
      const updatedDestinations = [...list.destinations];
      updatedDestinations[currentDestinationIndex] = {
        ...updatedDestinations[currentDestinationIndex],
        flight: flightDetails
      };
      
      await PackingList.update(list.id, { destinations: updatedDestinations });
      
      setList({
        ...list,
        destinations: updatedDestinations
      });
      
      toast({
        title: "Flight details added",
        description: "Your flight information has been saved to the trip"
      });
      
    } catch (error) {
      console.error("Error adding flight details:", error);
      toast({
        title: "Error",
        description: "Failed to add flight details",
        variant: "destructive"
      });
    }
  };

  const getListName = () => {
    if (!list) return "";
    if (list.name) return list.name;
    if (list.destinations && list.destinations.length > 0) {
      return list.destinations[0].location;
    }
    return list.destination || "Unnamed Trip";
  };

  const getDateRange = () => {
    if (!list) return { start: new Date(), end: new Date() };
    if (list.destinations && list.destinations.length > 0) {
      return {
        start: new Date(list.destinations[0].start_date),
        end: new Date(list.destinations[0].end_date)
      };
    }
    return {
      start: new Date(list.start_date),
      end: new Date(list.end_date)
    };
  };
  
  const getWeatherIcon = (conditions) => {
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
        is_favorite: !list.is_favorite
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  
  const handleDateRangeChange = (index, date) => {
    const newDestinations = [...list.destinations];
    newDestinations[index] = {
      ...newDestinations[index],
      start_date: date,
    };
    
    setList({
      ...list,
      destinations: newDestinations
    });
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
    if (!startDate || !endDate) return "Dates not set";
    const start = format(new Date(startDate), "MMM d");
    const end = format(new Date(endDate), "MMM d, yyyy");
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <LottieSpinner size={120} color="#3b82f6" />
      </div>
    );
  }
  
  if (!list) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">List not found</h2>
        <Button onClick={() => navigate(createPageUrl("Lists"))}>
          Back to Lists
        </Button>
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
              onClick={() => navigate(createPageUrl("Trips"))}
              className="p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold line-clamp-1">
                {list?.name || (list?.destinations?.[0]?.location || "Trip")}
              </h1>
              {list?.destinations?.[0] && (
                <p className="text-gray-500">
                  {formatDateRange(
                    list.destinations[0].start_date,
                    list.destinations[0].end_date
                  )}
                </p>
              )}
            </div>
          </div>
        
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={list.is_favorite ? "text-yellow-400" : "text-gray-400"}
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
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {list.destinations ? (
                list.destinations.map((destination, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <h3 className="font-medium">{destination.location}</h3>
                        </div>
                        <div className="space-y-2">
                          <Label>Trip Dates</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {destination.start_date ? (
                                  <>
                                    {format(new Date(destination.start_date), "MMM d, yyyy")}
                                    {" — "}
                                    {format(new Date(destination.end_date), "MMM d, yyyy")}
                                  </>
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <div className="p-3">
                                <div className="space-y-2">
                                  <Label>From</Label>
                                  <Input
                                    type="date"
                                    value={format(new Date(destination.start_date), "yyyy-MM-dd")}
                                    onChange={(e) => {
                                      const newDestinations = [...list.destinations];
                                      newDestinations[index] = {
                                        ...newDestinations[index],
                                        start_date: new Date(e.target.value),
                                      };
                                      setList({
                                        ...list,
                                        destinations: newDestinations
                                      });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2 mt-3">
                                  <Label>To</Label>
                                  <Input
                                    type="date"
                                    value={format(new Date(destination.end_date), "yyyy-MM-dd")}
                                    onChange={(e) => {
                                      const newDestinations = [...list.destinations];
                                      newDestinations[index] = {
                                        ...newDestinations[index],
                                        end_date: new Date(e.target.value),
                                      };
                                      setList({
                                        ...list,
                                        destinations: newDestinations
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {destination.start_date && destination.end_date ? (
                            <>
                              {format(new Date(destination.start_date), "MMM d")} - {format(new Date(destination.end_date), "MMM d, yyyy")}
                            </>
                          ) : (
                            "Dates not set"
                          )}
                        </p>
                      </div>
                      {destination.weather && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm">
                          {getWeatherIcon(destination.weather.conditions)}
                          <span>{destination.weather.min_temp}° - {destination.weather.max_temp}°C</span>
                        </div>
                      )}
                    </div>
                    
                    {destination.flight ? (
                      <FlightDetailsCard 
                        flight={destination.flight}
                        destinationDate={destination.start_date}
                        onEditFlight={() => handleAddFlightDetails(index)}
                      />
                    ) : (
                      <div className="flex justify-center py-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddFlightDetails(index)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Plane className="w-4 h-4 mr-2" />
                          Add Flight Details
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{list.destination}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(getDateRange().start, "MMM d")} - {format(getDateRange().end, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {list.accommodation && (
                  <Badge variant="outline" className="bg-gray-50">
                    {list.accommodation.replace(/_/g, ' ')}
                  </Badge>
                )}
                
                {list.activities && list.activities.map(activity => (
                  <Badge key={activity} className="bg-blue-100 text-blue-800">
                    {activity}
                  </Badge>
                ))}
                
                {list.companions && list.companions.map(companion => (
                  <Badge key={companion} className="bg-green-100 text-green-800">
                    {companion}
                  </Badge>
                ))}
                
                {list.amenities && list.amenities.map(amenity => (
                  <Badge key={amenity} variant="outline" className="bg-yellow-50">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Packing Progress</h3>
              
              <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="ml-auto">
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
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-category">Category</Label>
                        <Select 
                          value={newItem.category}
                          onValueChange={(value) => setNewItem({...newItem, category: value})}
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
                          onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="item-weather"
                        checked={newItem.weather_dependent}
                        onCheckedChange={(checked) => setNewItem({...newItem, weather_dependent: checked})}
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
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${list.items && list.items.length > 0 
                    ? (list.items.filter(item => item.is_packed).length / list.items.length) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {list.items && list.items.filter(item => item.is_packed).length} of {list.items ? list.items.length : 0} items packed
            </p>
          </div>
          
          {["clothing", "toiletries", "tech", "gear", "essentials", "additional"].map(category => {
            const categoryItems = list.items ? list.items.filter(item => item.category === category) : [];
            if (categoryItems.length === 0) return null;
            
            return (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y">
                    <AnimatePresence>
                      {categoryItems.map((item, index) => {
                        const itemIndex = list.items.findIndex(i => i === item);
                        return (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <AnimatedListItem
                              item={item}
                              onToggle={() => toggleItemPacked(itemIndex)}
                              onUpdateQuantity={(quantity) => handleUpdateItemQuantity(itemIndex, quantity)}
                              onDelete={isEditMode ? () => handleRemoveItem(itemIndex) : undefined}
                              isEditMode={isEditMode}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
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
