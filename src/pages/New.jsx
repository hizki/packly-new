
import React, { useState, useEffect, useRef } from "react";
import { PackingList } from "@/api/entities";
import { BaseList } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, MapPin, Check, Loader2, Cloud, Thermometer, Sun, CloudRain, XCircle, Plus, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/integrations";
import LottieSpinner from "../components/ui/lottie-spinner";
import { addDays } from "date-fns";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NewListPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState({});
  const [baseLists, setBaseLists] = useState([]);
  const [settings, setSettings] = useState({
    weather_sensitivity: { cold_threshold: 15, hot_threshold: 25 }
  });
  const [listName, setListName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState({});

  const mapRef = useRef(null);
  const mapsApiKeyRef = useRef("AIzaSyCRQCM884U1JmSt2We2GnBmxVTL347QUv0");
  const weatherApiKeyRef = useRef("ff088994400f0af3e062f4d57694f901");
  const inputRefs = useRef([]);

  const [formData, setFormData] = useState({
    destinations: [
      {
        location: "",
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        coordinates: null,
        weather: null,
        date_range: {
          from: new Date(),
          to: new Date(new Date().setDate(new Date().getDate() + 7)),
        }
      }
    ],
    activities: [],
    accommodation: "hotel",
    companions: [],
    amenities: [],
    items: []
  });

  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const [debugMsg, setDebugMsg] = useState("");
  const [hasSelectedPlace, setHasSelectedPlace] = useState(false);
  const [debugDestinations, setDebugDestinations] = useState([]);

  const hasValidDestination = formData.destinations.some(d => 
    d.location && d.location.trim().length > 0
  );

  const accommodationOptions = [
    { id: "hotel", label: "Hotel", icon: "🏨" },
    { id: "camping", label: "Camping", icon: "🏕️" },
    { id: "glamping", label: "Glamping", icon: "⛺" },
    { id: "couch_surfing", label: "Couch Surfing", icon: "🛋️" },
    { id: "airbnb", label: "Airbnb", icon: "🏠" }
  ];

  const companionOptions = [
    { id: "alone", label: "Alone", icon: "🧍" },
    { id: "spouse", label: "Spouse/Partner", icon: "💑" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧" }
  ];

  const activities = [
    { id: "beach", label: "Beach", icon: "🏖️" },
    { id: "camping", label: "Camping", icon: "🏕️" },
    { id: "climbing", label: "Climbing", icon: "🧗" },
    { id: "hiking", label: "Hiking", icon: "🥾" },
    { id: "partying", label: "Partying", icon: "🎉" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "sightseeing", label: "Sightseeing", icon: "🏛️" }
  ];

  const amenities = [
    { id: "laundry", label: "Laundry" },
    { id: "gym", label: "Gym" },
    { id: "pool", label: "Pool" },
    { id: "kitchen", label: "Kitchen" }
  ];

  useEffect(() => {
    loadUserSettings();

    return () => {
      const script = document.getElementById('google-maps-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (step === 1) {
      initializeGoogleMaps();
    }
  }, [step]);

  useEffect(() => {
    if (step === 1 && mapRef.current && window.google) {
      formData.destinations.forEach((_, index) => {
        const inputElement = document.getElementById(`destination-${index}`);
        if (inputElement) {
          inputElement.removeAttribute('data-autocomplete-initialized');
        }
      });
      
      initializeMapAndAutocomplete();
    }
  }, [formData.destinations.length]);

  useEffect(() => {
    if (step === 1 && mapRef.current && window.google) {
      const hasNewCoordinates = formData.destinations.some(dest => dest.coordinates);
      if (hasNewCoordinates) {
        setTimeout(() => {
          initializeMapAndAutocomplete();
        }, 100);
      }
    }
  }, [JSON.stringify(formData.destinations.map(d => d.coordinates))]);

  useEffect(() => {
    const hasValid = formData.destinations.some(d => 
      d.location && d.location.trim().length > 0
    );
    setNextButtonEnabled(hasValid);
  }, [formData.destinations]);

  const loadUserSettings = async () => {
    try {
      const user = await User.me();
      if (user.settings) {
        setSettings(user.settings);
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
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

  const getUserLocation = (map) => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }
    
    const handleLocationError = (error) => {
      console.warn(`ERROR(${error.code}): ${error.message}`);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        if (map) {
          map.setCenter(userLocation);
          map.setZoom(10);
          
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }
          });
        }
      },
      handleLocationError,
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const initializeGoogleMaps = () => {
    if (window.google || document.getElementById('google-maps-script')) {
      if (window.google) {
        initializeMapAndAutocomplete();
      }
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKeyRef.current}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeMapAndAutocomplete();
    };

    script.onerror = (error) => {
      console.error("Error loading Google Maps:", error);
    };
    
    document.body.appendChild(script);
  };

  const initializeMapAndAutocomplete = () => {
    if (!mapRef.current) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: 2
    });
    
    try {
      getUserLocation(map);
    } catch (error) {
      console.error("Error getting user location:", error);
    }
    
    const markers = [];
    
    const lastDestWithCoords = [...formData.destinations].reverse().find(d => d.coordinates);
    
    if (lastDestWithCoords) {
      map.setCenter(lastDestWithCoords.coordinates);
      map.setZoom(10);
      setHasSelectedPlace(true);
    }

    formData.destinations.forEach((destination, index) => {
      if (destination.coordinates && destination.location) {
        const marker = new window.google.maps.Marker({
          position: destination.coordinates,
          map: map,
          title: destination.location
        });
        
        markers.push(marker);
      }

      const inputElement = document.getElementById(`destination-${index}`);
      if (!inputElement) return;

      const existingAutocomplete = inputElement.getAttribute('data-autocomplete-initialized');
      if (existingAutocomplete === 'true') {
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputElement);
      autocomplete.setFields(['address_components', 'geometry', 'name', 'formatted_address']); 
      
      inputElement.setAttribute('data-autocomplete-initialized', 'true');

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const locationName = place.name || place.formatted_address || inputElement.value;

        if (markers[index]) {
          markers[index].setMap(null);
        }
        
        const marker = new window.google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: locationName
        });
        
        markers[index] = marker;

        const newDestinations = [...formData.destinations];
        newDestinations[index] = {
          ...newDestinations[index],
          location: locationName,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        };
        
        setFormData(prev => ({
          ...prev,
          destinations: newDestinations
        }));
        
        setHasSelectedPlace(true);
        
        map.setCenter(place.geometry.location);
        map.setZoom(12);

        fetchWeatherForDestination(index, {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      });
    });
  };

  const fetchWeatherForDestination = async (index, coordinates) => {
    if (!coordinates) return;

    setWeatherLoading(prev => ({ ...prev, [index]: true }));
    try {
      const startDate = formData.destinations[index].start_date;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&appid=${weatherApiKeyRef.current}`
      );
      const data = await response.json();
      
      if (data) {
        const newDestinations = [...formData.destinations];
        newDestinations[index] = {
          ...newDestinations[index],
          weather: {
            min_temp: Math.round(data.main.temp_min),
            max_temp: Math.round(data.main.temp_max),
            conditions: data.weather[0].main
          }
        };
        
        setFormData(prev => ({
          ...prev,
          destinations: prev.destinations.map((dest, i) => 
            i === index ? { ...dest, weather: newDestinations[index].weather } : dest
          )
        }));
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setWeatherLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleAddDestination = () => {
    const lastDestination = formData.destinations[formData.destinations.length - 1];
    const startDate = new Date(lastDestination.end_date);
    const endDate = addDays(startDate, 7);
    
    const newDestination = {
      location: "",
      start_date: startDate,
      end_date: endDate,
      coordinates: null,
      weather: null,
      date_range: {
        from: startDate,
        to: endDate
      }
    };
    
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, newDestination]
    }));
    
    setTimeout(() => {
      formData.destinations.forEach((_, index) => {
        const inputElement = document.getElementById(`destination-${index}`);
        if (inputElement) {
          inputElement.removeAttribute('data-autocomplete-initialized');
        }
      });
      
      initializeMapAndAutocomplete();
    }, 500);
  };

  const handleRemoveDestination = (index) =>  {
    if (formData.destinations.length === 1) return;
    
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      destinations: newDestinations
    }));
    
    setTimeout(() => {
      newDestinations.forEach((_, index) => {
        const inputElement = document.getElementById(`destination-${index}`);
        if (inputElement) {
          inputElement.removeAttribute('data-autocomplete-initialized');
        }
      });
      
      initializeMapAndAutocomplete();
    }, 500);
  };

  const handleDateChange = (index, field, date) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = {
      ...newDestinations[index],
      [field]: date
    };
    
    if (field === 'end_date' && index < newDestinations.length - 1) {
      const nextStartDate = new Date(date);
      const nextEndDate = addDays(nextStartDate, 7);
      
      newDestinations[index + 1] = {
        ...newDestinations[index + 1],
        start_date: nextStartDate,
        end_date: nextEndDate
      };
    }
    
    setFormData(prev => ({
      ...prev,
      destinations: newDestinations
    }));
    
    if (newDestinations[index].coordinates) {
      fetchWeatherForDestination(index, newDestinations[index].coordinates);
    }
  };

  const handleActivityToggle = (activityId) => {
    setFormData(prev => {
      if (prev.activities.includes(activityId)) {
        return {
          ...prev,
          activities: prev.activities.filter(id => id !== activityId)
        };
      } else {
        return {
          ...prev,
          activities: [...prev.activities, activityId]
        };
      }
    });
  };

  const handleCompanionToggle = (companionId) => {
    setFormData(prev => {
      if (prev.companions.includes(companionId)) {
        return {
          ...prev,
          companions: prev.companions.filter(id => id !== companionId)
        };
      } else {
        return {
          ...prev,
          companions: [...prev.companions, companionId]
        };
      }
    });
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => {
      if (prev.amenities.includes(amenityId)) {
        return {
          ...prev,
          amenities: prev.amenities.filter(id => id !== amenityId)
        };
      } else {
        return {
          ...prev,
          amenities: [...prev.amenities, amenityId]
        };
      }
    });
  };

  const getItemsFromBaseLists = () => {
    let items = [];
    
    formData.activities.forEach(activity => {
      const baseList = baseLists.find(l => l.list_type === "activity" && l.category === activity);
      if (baseList && baseList.items) {
        items = [...items, ...baseList.items.map(item => ({
          ...item,
          is_packed: false
        }))];
      }
    });
    
    const accommodationList = baseLists.find(
      l => l.list_type === "accommodation" && l.category === formData.accommodation
    );
    if (accommodationList && accommodationList.items) {
      items = [...items, ...accommodationList.items.map(item => ({
        ...item,
        is_packed: false
      }))];
    }
    
    formData.companions.forEach(companion => {
      const baseList = baseLists.find(l => l.list_type === "companion" && l.category === companion);
      if (baseList && baseList.items) {
        items = [...items, ...baseList.items.map(item => ({
          ...item,
          is_packed: false
        }))];
      }
    });
    
    const uniqueItems = [];
    const itemNames = new Set();
    items.forEach(item => {
      if (!itemNames.has(item.name)) {
        itemNames.add(item.name);
        uniqueItems.push(item);
      }
    });
    
    return uniqueItems;
  };

  const generateListName = () => {
    const validDestinations = formData.destinations.filter(d => 
      d && d.location && d.location.trim().length > 0
    );
    
    if (!validDestinations.length) {
      return "My Packing List";
    }
    
    const destinationNames = validDestinations.map(d => d.location);
    
    let totalTripDays = 0;
    validDestinations.forEach(destination => {
      const startDate = new Date(destination.start_date);
      const endDate = new Date(destination.end_date);
      const durationMs = endDate.getTime() - startDate.getTime();
      const destinationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
      totalTripDays += destinationDays;
    });
    
    const includesWeekend = validDestinations.some(destination => {
      const startDate = new Date(destination.start_date);
      const endDate = new Date(destination.end_date);
      const startDay = startDate.getDay();
      const endDay = endDate.getDay();
      const durationMs = endDate.getTime() - startDate.getTime();
      const destinationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
      
      return startDay === 0 || startDay === 6 || endDay === 0 || endDay === 6 ||
             (destinationDays >= 7) || 
             (startDay < 6 && startDay + destinationDays > 6);
    });
    
    let timeframe = "";
    if (totalTripDays <= 4 && includesWeekend) {
      timeframe = "A weekend";
    } else if (totalTripDays >= 6 && totalTripDays <= 8) {
      timeframe = "A week";
    } else if (totalTripDays >= 13 && totalTripDays <= 16) {
      timeframe = "A couple of weeks";
    } else if (totalTripDays <= 20) {
      timeframe = `${totalTripDays} days`;
    } else {
      timeframe = `${Math.round(totalTripDays / 7)} weeks`;
    }
    
    if (formData.accommodation === "camping") {
      timeframe += " of camping";
    }
    
    let destinationText = "";
    if (destinationNames.length === 1) {
      destinationText = destinationNames[0];
    } else if (destinationNames.length === 2) {
      destinationText = `${destinationNames[0]} and ${destinationNames[1]}`;
    } else if (destinationNames.length > 2) {
      const namesCopy = [...destinationNames];
      const lastDestination = namesCopy.pop();
      destinationText = `${namesCopy.join(', ')} and ${lastDestination}`;
    } else {
      destinationText = "my trip";
    }
    
    return `${timeframe} in ${destinationText}`;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (formData.activities.length === 0) {
      errors.activities = "Select at least one activity";
    }
    
    if (!formData.accommodation) {
      errors.accommodation = "Select where you're staying";
    }
    
    if (formData.companions.length === 0) {
      errors.companions = "Select who you're traveling with";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep2Next = () => {
    if (validateStep2()) {
      generatePackingList();
    }
  };

  const generatePackingList = async () => {
    setIsProcessing(true);
    try {
      const baseItems = getItemsFromBaseLists();
      const weatherData = formData.destinations.map(d => d.weather).filter(Boolean);
      const hasWeatherData = weatherData.length > 0;
      
      let avgTemp = 0;
      if (hasWeatherData) {
        const tempSum = weatherData.reduce((sum, w) => sum + ((w.min_temp + w.max_temp) / 2), 0);
        avgTemp = tempSum / weatherData.length;
      }
      
      const weatherType = hasWeatherData
        ? avgTemp < settings.weather_sensitivity.cold_threshold
          ? "cold"
          : avgTemp > settings.weather_sensitivity.hot_threshold
            ? "hot"
            : "mild"
        : "unknown";
      
      const destinationsText = formData.destinations
        .map(d => `${d.location} (${format(d.start_date, "MMM d")} to ${format(d.end_date, "MMM d")})`)
        .join(", ");
      
      const prompt = `
        Create a comprehensive packing list for a trip to ${destinationsText}. 
        Trip details:
        - Weather: ${weatherType} (${hasWeatherData ? `${avgTemp}°C average` : 'unknown'})
        - Activities: ${formData.activities.join(", ")}
        - Accommodation: ${formData.accommodation}
        - Traveling with: ${formData.companions.length > 0 ? formData.companions.join(", ") : "alone"}
        - Available amenities: ${formData.amenities.join(", ") || "none"}
        
        I already have these items on my list:
        ${baseItems.map(item => `- ${item.name} (${item.category})`).join("\n")}
        
        Generate additional items to pack organized by category. Each item should have a name, category (clothing, toiletries, tech, gear, essentials), and quantity.
        Focus on weather-appropriate items for ${weatherType} weather.
      `;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { 
                    type: "string", 
                    enum: ["clothing", "toiletries", "tech", "gear", "essentials"] 
                  },
                  quantity: { type: "number" },
                  is_packed: { type: "boolean", default: false },
                  weather_dependent: { type: "boolean", default: false }
                }
              }
            }
          }
        }
      });

      const combinedItems = [
        ...baseItems, 
        ...(response.items || [])
      ];
      
      const uniqueItems = [];
      const itemNames = new Set();
      combinedItems.forEach(item => {
        if (!itemNames.has(item.name)) {
          item.is_packed = false; 
          itemNames.add(item.name);
          uniqueItems.push(item);
        }
      });

      setFormData(prev => ({
        ...prev,
        items: uniqueItems
      }));

      const generatedName = generateListName();
      console.log("Generated name for list:", generatedName, "based on destinations:", formData.destinations);
      setListName(generatedName);

      setStep(3);
    } catch (error) {
      console.error("Error generating packing list:", error);
      setFormData(prev => ({
        ...prev,
        items: getItemsFromBaseLists().map(item => ({...item, is_packed: false}))
      }));
      const generatedName = generateListName();
      setListName(generatedName);
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveList = async () => {
    setIsProcessing(true);
    try {
      const user = await User.me();
      
      const list = await PackingList.create({
        ...formData,
        name: listName || generateListName(),
        owner_id: user.id
      });
      
      navigate(createPageUrl(`ListDetail?id=${list.id}`));
    } catch (error) {
      console.error("Error saving list:", error);
    } finally {
      setIsProcessing(false);
    }
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

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <LottieSpinner size={120} color="#3b82f6" />
        <p className="mt-4 text-gray-600">Creating your packing list...</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create a New Trip</h1>
          <p className="text-gray-500">Let us help you prepare for your journey</p>
        </div>

        <div className="flex justify-between mb-8">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="text-xs mt-1">Destinations</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className={`h-1 w-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <span className="text-xs mt-1">Details</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className={`h-1 w-full ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              3
            </div>
            <span className="text-xs mt-1">Review</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Where are you going?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Destination {index + 1}</h3>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDestination(index)}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`destination-${index}`}>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`destination-${index}`}
                          placeholder="Search for a destination"
                          className="pl-9"
                          value={destination.location}
                          onChange={(e) => {
                            const newDestinations = [...formData.destinations];
                            newDestinations[index] = {
                              ...newDestinations[index],
                              location: e.target.value
                            };
                            
                            if (!e.target.value.trim()) {
                              newDestinations[index].coordinates = null;
                            }
                            
                            setFormData(prev => ({
                              ...prev,
                              destinations: newDestinations
                            }));
                          }}
                          ref={el => inputRefs.current[index] = el}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Trip Dates</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal overflow-hidden"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                            {destination.start_date ? (
                              <span className="truncate">
                                {format(destination.start_date, "MMM d")}
                                {" — "}
                                {format(destination.end_date, "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3">
                            <div className="space-y-2">
                              <Label>From</Label>
                              <Input
                                type="date"
                                value={format(destination.start_date, "yyyy-MM-dd")}
                                min={index === 0 ? format(new Date(), "yyyy-MM-dd") : format(formData.destinations[index - 1].end_date, "yyyy-MM-dd")}
                                onChange={(e) => handleDateChange(index, 'start_date', new Date(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2 mt-3">
                              <Label>To</Label>
                              <Input
                                type="date"
                                value={format(destination.end_date, "yyyy-MM-dd")}
                                min={format(destination.start_date, "yyyy-MM-dd")}
                                onChange={(e) => handleDateChange(index, 'end_date', new Date(e.target.value))}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {destination.weather && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getWeatherIcon(destination.weather.conditions)}
                          <span className="text-sm font-medium">{destination.weather.conditions}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm">
                            {destination.weather.min_temp}°C - {destination.weather.max_temp}°C
                          </span>
                        </div>
                      </div>
                    )}

                    {weatherLoading[index] && (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading weather data...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div 
                ref={mapRef} 
                className="w-full h-64 rounded-lg border" 
              />

              <Button
                variant="outline"
                onClick={handleAddDestination}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Destination
              </Button>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!hasValidDestination}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="block mb-3">What activities are you planning?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${formData.activities.includes(activity.id) 
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50" 
                          : "hover:bg-gray-50"
                        }
                      `}
                      onClick={() => handleActivityToggle(activity.id)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-2xl">{activity.icon}</span>
                        <span className="text-sm font-medium">{activity.label}</span>
                        {formData.activities.includes(activity.id) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.activities && (
                  <p className="text-sm text-red-500 mt-2">{validationErrors.activities}</p>
                )}
              </div>

              <div>
                <Label className="block mb-3">Where are you staying?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {accommodationOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${formData.accommodation === option.id 
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50" 
                          : "hover:bg-gray-50"
                        }
                      `}
                      onClick={() => setFormData({...formData, accommodation: option.id})}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.accommodation && (
                  <p className="text-sm text-red-500 mt-2">{validationErrors.accommodation}</p>
                )}
              </div>

              <div>
                <Label className="block mb-3">Who are you traveling with?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {companionOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${formData.companions.includes(option.id) 
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50" 
                          : "hover:bg-gray-50"
                        }
                      `}
                      onClick={() => handleCompanionToggle(option.id)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                        {formData.companions.includes(option.id) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.companions && (
                  <p className="text-sm text-red-500 mt-2">{validationErrors.companions}</p>
                )}
              </div>

              <div>
                <Label className="block mb-3">Available amenities at your destination</Label>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <div 
                      key={amenity.id} 
                      className="flex items-center space-x-2"
                    >
                      <Checkbox 
                        id={amenity.id} 
                        checked={formData.amenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity.id)}
                      />
                      <Label 
                        htmlFor={amenity.id}
                        className="cursor-pointer"
                      >
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                onClick={handleStep2Next}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating List...
                  </>
                ) : (
                  "Generate Packing List"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      className="text-xl font-bold"
                      autoFocus
                    />
                    <Button 
                      size="sm"
                      onClick={() => setIsEditingName(false)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <CardTitle className="flex items-center gap-2">
                    {listName}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-1">Trip Summary</h3>
                  <div className="space-y-2">
                    {formData.destinations.map((destination, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{destination.location}</p>
                          <p className="text-sm text-gray-600">
                            {format(destination.start_date, "MMM d")} - {format(destination.end_date, "MMM d, yyyy")}
                          </p>
                        </div>
                        {destination.weather && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm">
                            {getWeatherIcon(destination.weather.conditions)}
                            <span>{destination.weather.min_temp}° - {destination.weather.max_temp}°C</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs">
                      <span className="font-medium">Staying at:</span>
                      <span>{accommodationOptions.find(a => a.id === formData.accommodation)?.label}</span>
                    </div>
                    {formData.activities.map(activity => (
                      <span key={activity} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {activity}
                      </span>
                    ))}
                    {formData.companions.map(companion => (
                      <span key={companion} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {companion}
                      </span>
                    ))}
                  </div>
                </div>
                
                {formData.destinations.some(d => d.weather) && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Weather-Based Recommendations</h3>
                    <div className="text-sm text-gray-600">
                      {formData.destinations.some(d => d.weather && d.weather.max_temp < settings.weather_sensitivity.cold_threshold) && (
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="text-blue-500 w-4 h-4" />
                          <span>Pack warm clothing for cold weather.</span>
                        </div>
                      )}
                      {formData.destinations.some(d => d.weather && d.weather.min_temp > settings.weather_sensitivity.hot_threshold) && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="text-orange-500 w-4 h-4" />
                          <span>Pack light, breathable clothing for hot weather.</span>
                        </div>
                      )}
                      {formData.destinations.some(d => d.weather && d.weather.conditions.toLowerCase().includes('rain')) && (
                        <div className="flex items-center gap-2">
                          <CloudRain className="text-blue-500 w-4 h-4" />
                          <span>Don't forget rain gear!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {["clothing", "toiletries", "tech", "gear", "essentials"].map(category => {
                  const categoryItems = formData.items.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="font-semibold capitalize mb-2">{category}</h3>
                      <div className="border rounded-lg divide-y">
                        {categoryItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`item-${category}-${idx}`}
                                checked={item.is_packed}
                                onCheckedChange={(checked) => {
                                  const newItems = [...formData.items];
                                  newItems[formData.items.findIndex(i => i === item)].is_packed = checked;
                                  setFormData({ ...formData, items: newItems });
                                }}
                              />
                              <Label 
                                htmlFor={`item-${category}-${idx}`}
                                className={`cursor-pointer ${item.is_packed ? "line-through text-gray-400" : ""}`}
                              >
                                {item.name}
                                {item.weather_dependent && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    Weather
                                  </span>
                                )}
                              </Label>
                            </div>
                            <span className="text-sm text-gray-500">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button 
                onClick={saveList}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Trip"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
