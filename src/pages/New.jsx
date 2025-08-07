import { useState, useEffect, useRef } from 'react';
import { PackingList, User, List } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CalendarIcon,
  MapPin,
  Check,
  Loader2,
  Cloud,
  Thermometer,
  Sun,
  CloudRain,
  XCircle,
  Plus,
  Pencil,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import LottieSpinner from '../components/ui/lottie-spinner';
import { addDays } from 'date-fns';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchWeatherForDate } from '@/services/weatherService';
import { generateEmojisForItems } from '@/utils/emojiGenerator';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function NewListPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState({});
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    weather_sensitivity: { cold_threshold: 15, hot_threshold: 25 },
  });
  const [listName, setListName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [missingInfoWarnings, setMissingInfoWarnings] = useState([]);
  const [travelTips, setTravelTips] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});

  // Dynamic options loaded from database
  const [accommodationOptions, setAccommodationOptions] = useState([]);
  const [companionOptions, setCompanionOptions] = useState([]);
  const [activities, setActivities] = useState([]);

  const mapRef = useRef(null);
  const mapsApiKeyRef = useRef(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const inputRefs = useRef([]);
  const autocompleteRefs = useRef([]);
  const mapInstance = useRef(null);

  const [formData, setFormData] = useState({
    destinations: [
      {
        location: '',
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        coordinates: null,
        weather: null,
        date_range: {
          from: new Date(),
          to: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
      },
    ],
    activities: [],
    accommodation: [],
    companions: [],
    amenities: [],
    items: [],
  });

  const hasValidDestination = formData.destinations.some(
    d => d.location && d.location.trim().length > 0,
  );

  const amenities = [
    { id: 'laundry', label: 'Laundry' },
    { id: 'gym', label: 'Gym' },
    { id: 'pool', label: 'Pool' },
    { id: 'kitchen', label: 'Kitchen' },
  ];

  useEffect(() => {
    loadDynamicOptions();
    loadUserSettings();

    return () => {
      cleanupGoogleMapsComponents();
      const script = document.getElementById('google-maps-script');
      if (script) {
        script.remove();
      }
    };
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

  // Auto-scroll to top when step changes
  useEffect(() => {
    // Add a small delay to ensure the new step content is rendered
    const timeoutId = setTimeout(() => {
      // Find the main scroll container (the main element with overflow-auto)
      const mainElement = document.querySelector('main[class*="overflow-auto"]');
      
      if (mainElement) {
        // Scroll the main container
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to window scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [step]);

  useEffect(() => {
    if (step === 1) {
      // Add a small delay to ensure the component is fully mounted
      const timeoutId = setTimeout(() => {
        initializeGoogleMaps();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [step]);

  useEffect(() => {
    if (step === 1 && mapRef.current && window.google) {
      // Only reinitialize if destinations array length changes significantly
      const timeoutId = setTimeout(() => {
        initializeMapAndAutocomplete();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.destinations.length]);

  // Remove the coordinates-based useEffect as it causes too many re-initializations

  const loadDynamicOptions = async () => {
    setLoading(true);
    try {
      // Get current user
      const user = await User.me();
      
      // Load user's actual lists from database
      const [activityLists, accommodationLists, companionLists] = await Promise.all([
        List.filter({ owner_id: user.id, list_type: 'activity' }),
        List.filter({ owner_id: user.id, list_type: 'accommodation' }),
        List.filter({ owner_id: user.id, list_type: 'companion' }),
      ]);

      // Transform to expected format
      setActivities(activityLists.map(list => ({
        id: list.list_name,
        label: list.name || list.list_name,
        icon: list.icon || '📝',
      })));

      setAccommodationOptions(accommodationLists.map(list => ({
        id: list.list_name,
        label: list.name || list.list_name,
        icon: list.icon || '🏠',
      })));

      setCompanionOptions(companionLists.map(list => ({
        id: list.list_name,
        label: list.name || list.list_name,
        icon: list.icon || '👥',
      })));

      // Set default accommodation if available
      if (accommodationLists.length > 0) {
        setFormData(prev => ({
          ...prev,
          accommodation: [accommodationLists[0].list_name],
        }));
      }

    } catch (error) {
      console.error('Error loading dynamic options:', error);
      // Fallback to basic options if API fails
      setActivities([
        { id: 'beach', label: 'Beach', icon: '🏖️' },
        { id: 'hiking', label: 'Hiking', icon: '🥾' },
        { id: 'business', label: 'Business', icon: '💼' },
      ]);
      setAccommodationOptions([
        { id: 'hotel', label: 'Hotel', icon: '🏨' },
        { id: 'airbnb', label: 'Airbnb', icon: '🏠' },
      ]);
      setCompanionOptions([
        { id: 'alone', label: 'Alone', icon: '🧍' },
        { id: 'friends', label: 'Friends', icon: '👥' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const user = await User.me();
      if (user.settings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...user.settings,
          weather_sensitivity: {
            ...prevSettings.weather_sensitivity,
            ...user.settings.weather_sensitivity,
          },
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const cleanupGoogleMapsComponents = () => {
    // Clear autocomplete instances and their event listeners
    autocompleteRefs.current.forEach(autocomplete => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    });
    autocompleteRefs.current = [];

    // Remove any floating pac-container elements
    const pacContainers = document.querySelectorAll('.pac-container');
    pacContainers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    // Reset autocomplete initialization flags
    formData.destinations.forEach((_, index) => {
      const inputElement = document.getElementById(`destination-${index}`);
      if (inputElement) {
        inputElement.removeAttribute('data-autocomplete-initialized');
      }
    });

    // Clear map instance
    if (mapInstance.current) {
      mapInstance.current = null;
    }
  };

  const getUserLocation = map => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    const handleLocationError = error => {
      console.warn(`ERROR(${error.code}): ${error.message}`);
    };

    navigator.geolocation.getCurrentPosition(
      position => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map) {
          map.setCenter(userLocation);
          map.setZoom(10);

          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Your location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        }
      },
      handleLocationError,
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  };

  const initializeGoogleMaps = () => {
    console.log('Initializing Google Maps...');

    // Check if API key is available
    if (!mapsApiKeyRef.current || mapsApiKeyRef.current === 'your_google_maps_api_key') {
      console.warn(
        'Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file',
      );
      return;
    }

    console.log('Google Maps API key found:', mapsApiKeyRef.current.substring(0, 10) + '...');

    if (window.google) {
      console.log('Google Maps already loaded, initializing autocomplete');
      initializeMapAndAutocomplete();
      return;
    }

    if (document.getElementById('google-maps-script')) {
      console.log('Google Maps script already exists, waiting for load');
      return;
    }

    console.log('Creating Google Maps script tag');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKeyRef.current}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setTimeout(() => {
        initializeMapAndAutocomplete();
      }, 100);
    };

    script.onerror = error => {
      console.error('Error loading Google Maps:', error);
      // Remove the failed script so we can try again
      const failedScript = document.getElementById('google-maps-script');
      if (failedScript) {
        failedScript.remove();
      }
    };

    document.body.appendChild(script);
    console.log('Google Maps script tag added to document');
  };

  const initializeMapAndAutocomplete = () => {
    if (!mapRef.current || !window.google) {
      console.log('Map ref or Google not available yet');
      return;
    }

    console.log('Initializing Google Maps and autocomplete');

    try {
      // Initialize map if not already done
      if (!mapInstance.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeControl: false, // Remove map/satellite toggle
          streetViewControl: false, // Remove street view yellow person icon
          rotateControl: false, // Remove camera rotation controls
          tiltControl: false, // Remove camera tilt controls
          gestureHandling: 'greedy', // Disable gesture-based camera controls
          disableDefaultUI: false, // Keep some default UI but selectively disable
          fullscreenControl: true, // Keep fullscreen control
          zoomControl: true, // Keep zoom controls
          keyboardShortcuts: false, // Disable keyboard camera controls
          clickableIcons: false, // Disable clickable POI icons that can trigger camera
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180,
            },
            strictBounds: false,
          },
          minZoom: 1,
          maxZoom: 18,
        });

        // Force hide camera controls with CSS after map loads
        setTimeout(() => {
          const style = document.createElement('style');
          style.textContent = `
            .gmp-internal-camera-control,
            [data-value="tilt"],
            [data-value="rotate"],
            .gmnoprint[title="Rotate map 90 degrees"],
            .gmnoprint[title="Tilt map"],
            .gmnoprint[title="Rotate map"],
            button[title*="camera"],
            button[title*="Camera"],
            button[title*="rotate"],
            button[title*="Rotate"],
            button[title*="tilt"],
            button[title*="Tilt"] {
              display: none !important;
              visibility: hidden !important;
            }
          `;
          document.head.appendChild(style);
        }, 100);

        mapInstance.current = map;

        // try {
        //   getUserLocation(map); // Removed automatic location request
        // } catch (error) {
        //   console.error('Error getting user location:', error);
        // }
      }

      const map = mapInstance.current;
      const markers = [];

      const lastDestWithCoords = [...formData.destinations].reverse().find(d => d.coordinates);

      if (lastDestWithCoords) {
        map.setCenter(lastDestWithCoords.coordinates);
        map.setZoom(10);
      }

      // Add markers for existing destinations with coordinates
      formData.destinations.forEach(destination => {
        if (destination.coordinates && destination.location) {
          const marker = new window.google.maps.Marker({
            position: destination.coordinates,
            map: map,
            title: destination.location,
          });

          markers.push(marker);
        }
      });

      // Initialize autocomplete for each destination input that doesn't have it yet
      formData.destinations.forEach((destination, index) => {
        const inputElement = document.getElementById(`destination-${index}`);
        if (!inputElement) {
          console.warn(`Input element destination-${index} not found`);
          return;
        }

        const existingAutocomplete = inputElement.getAttribute('data-autocomplete-initialized');
        if (existingAutocomplete === 'true') {
          console.log(`Autocomplete already exists for destination-${index}`);
          return;
        }

        try {
          console.log(`Creating autocomplete for destination-${index}`);
          const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
            types: ['(cities)'],
            fields: ['address_components', 'geometry', 'name', 'formatted_address'],
          });

          // Store autocomplete instance for cleanup
          autocompleteRefs.current[index] = autocomplete;
          inputElement.setAttribute('data-autocomplete-initialized', 'true');

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            const locationName = place.name || place.formatted_address || inputElement.value;

            // Remove existing marker for this destination
            if (markers[index]) {
              markers[index].setMap(null);
            }

            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: locationName,
            });

            markers[index] = marker;

            const newDestinations = [...formData.destinations];
            newDestinations[index] = {
              ...newDestinations[index],
              location: locationName,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            };

            setFormData(prev => ({
              ...prev,
              destinations: newDestinations,
            }));

            map.setCenter(place.geometry.location);
            map.setZoom(12);

            fetchWeatherForDestination(
              index, 
              {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              newDestinations[index].start_date,
              newDestinations[index].end_date,
            );
          });
        } catch (autocompleteError) {
          console.error('Error creating autocomplete for input', index, autocompleteError);
          // Reset the initialization flag on error
          inputElement.removeAttribute('data-autocomplete-initialized');
        }
      });
    } catch (mapError) {
      console.error('Error initializing Google Maps:', mapError);
      cleanupGoogleMapsComponents();
    }
  };

  const fetchWeatherForDestination = async (
    index, coordinates, startDate = null, endDate = null,
  ) => {
    if (!coordinates) return;

    setWeatherLoading(prev => ({ ...prev, [index]: true }));
    try {
      const weather = await fetchWeatherForDate(
        coordinates.lat,
        coordinates.lng,
        startDate || new Date(),
        endDate,
      );

      if (weather) {
        const newDestinations = [...formData.destinations];
        newDestinations[index] = {
          ...newDestinations[index],
          weather,
        };

        setFormData(prev => ({
          ...prev,
          destinations: prev.destinations.map((dest, i) =>
            i === index ? { ...dest, weather: newDestinations[index].weather } : dest,
          ),
        }));
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setWeatherLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleAddDestination = () => {
    const lastDestination = formData.destinations[formData.destinations.length - 1];
    const startDate = new Date(lastDestination.end_date);
    const endDate = addDays(startDate, 7);

    const newDestinationIndex = formData.destinations.length; // This will be the index of the newly added destination

    const newDestination = {
      location: '',
      start_date: startDate,
      end_date: endDate,
      coordinates: null,
      weather: null,
      date_range: {
        from: startDate,
        to: endDate,
      },
    };

    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, newDestination],
    }));

    setTimeout(() => {
      if (window.google) {
        console.log('Reinitializing autocomplete after adding destination');
        initializeMapAndAutocomplete();
      }

      // Focus on the new destination input field
      const newInputElement = document.getElementById(`destination-${newDestinationIndex}`);
      if (newInputElement) {
        newInputElement.focus();
      }
    }, 300);
  };

  const handleRemoveDestination = index => {
    if (formData.destinations.length === 1) return;

    // Clean up the specific autocomplete instance being removed
    const inputElement = document.getElementById(`destination-${index}`);
    if (inputElement) {
      inputElement.removeAttribute('data-autocomplete-initialized');
    }

    if (autocompleteRefs.current[index] && window.google?.maps?.event) {
      window.google.maps.event.clearInstanceListeners(autocompleteRefs.current[index]);
    }

    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      destinations: newDestinations,
    }));

    // Clean up autocomplete refs array
    autocompleteRefs.current = autocompleteRefs.current.filter((_, i) => i !== index);

    setTimeout(() => {
      if (window.google) {
        console.log('Reinitializing autocomplete after removing destination');
        initializeMapAndAutocomplete();
      }
    }, 300);
  };

  const handleDateRangeChange = (index, ranges) => {
    const { startDate, endDate } = ranges.selection;
    const newDestinations = [...formData.destinations];
    
    newDestinations[index] = {
      ...newDestinations[index],
      start_date: startDate,
      end_date: endDate,
    };

    // Update subsequent destinations if this is not the last one
    if (index < newDestinations.length - 1) {
      const nextStartDate = new Date(endDate);
      const nextEndDate = addDays(nextStartDate, 7);

      newDestinations[index + 1] = {
        ...newDestinations[index + 1],
        start_date: nextStartDate,
        end_date: nextEndDate,
      };
    }

    setFormData(prev => ({
      ...prev,
      destinations: newDestinations,
    }));

    if (newDestinations[index].coordinates) {
      fetchWeatherForDestination(
        index, 
        newDestinations[index].coordinates, 
        newDestinations[index].start_date,
        newDestinations[index].end_date,
      );
    }
  };

  const handleActivityToggle = activityId => {
    setFormData(prev => {
      if (prev.activities.includes(activityId)) {
        return {
          ...prev,
          activities: prev.activities.filter(id => id !== activityId),
        };
      } else {
        return {
          ...prev,
          activities: [...prev.activities, activityId],
        };
      }
    });
  };

  const handleCompanionToggle = companionId => {
    setFormData(prev => {
      if (prev.companions.includes(companionId)) {
        return {
          ...prev,
          companions: prev.companions.filter(id => id !== companionId),
        };
      } else {
        return {
          ...prev,
          companions: [...prev.companions, companionId],
        };
      }
    });
  };

  const handleAccommodationToggle = accommodationId => {
    setFormData(prev => {
      if (prev.accommodation.includes(accommodationId)) {
        return {
          ...prev,
          accommodation: prev.accommodation.filter(id => id !== accommodationId),
        };
      } else {
        return {
          ...prev,
          accommodation: [...prev.accommodation, accommodationId],
        };
      }
    });
  };

  const handleAmenityToggle = amenityId => {
    setFormData(prev => {
      if (prev.amenities.includes(amenityId)) {
        return {
          ...prev,
          amenities: prev.amenities.filter(id => id !== amenityId),
        };
      } else {
        return {
          ...prev,
          amenities: [...prev.amenities, amenityId],
        };
      }
    });
  };

  const generateListName = () => {
    const validDestinations = formData.destinations.filter(
      d => d && d.location && d.location.trim().length > 0,
    );

    if (!validDestinations.length) {
      return 'My Packing List';
    }

    // Remove duplicate destination names while preserving order
    const destinationNames = [...new Set(validDestinations.map(d => d.location))];

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

      return (
        startDay === 0 ||
        startDay === 6 ||
        endDay === 0 ||
        endDay === 6 ||
        destinationDays >= 7 ||
        (startDay < 6 && startDay + destinationDays > 6)
      );
    });

    let timeframe = '';
    if (totalTripDays <= 4 && includesWeekend) {
      timeframe = 'A weekend';
    } else if (totalTripDays >= 6 && totalTripDays <= 8) {
      timeframe = 'A week';
    } else if (totalTripDays >= 13 && totalTripDays <= 16) {
      timeframe = 'A couple of weeks';
    } else if (totalTripDays <= 20) {
      timeframe = `${totalTripDays} days`;
    } else if (totalTripDays <= 28) {
      timeframe = `${Math.round(totalTripDays / 7)} weeks`;
    } else {
      // Month-based logic for trips over 4 weeks
      const months = totalTripDays / 30.5; // Average days per month

      if (totalTripDays <= 42) {
        timeframe = 'Over a month';
      } else if (totalTripDays <= 52) {
        timeframe = 'A month and a half';
      } else if (totalTripDays <= 67) {
        timeframe = 'Nearly 2 months';
      } else {
        // For longer trips, calculate months more precisely
        const fullMonths = Math.floor(months);
        const remainingDays = totalTripDays - fullMonths * 30.5;

        if (remainingDays <= 10) {
          timeframe = fullMonths === 2 ? '2 months' : `${fullMonths} months`;
        } else if (remainingDays <= 20) {
          timeframe = `${fullMonths} and a half months`;
        } else {
          timeframe = `Nearly ${fullMonths + 1} months`;
        }
      }
    }

    if (Array.isArray(formData.accommodation) && formData.accommodation.includes('camping')) {
      timeframe += ' of camping';
    }

    let destinationText = '';
    if (destinationNames.length === 1) {
      destinationText = destinationNames[0];
    } else if (destinationNames.length === 2) {
      destinationText = `${destinationNames[0]} and ${destinationNames[1]}`;
    } else if (destinationNames.length > 2) {
      const namesCopy = [...destinationNames];
      const lastDestination = namesCopy.pop();
      destinationText = `${namesCopy.join(', ')} and ${lastDestination}`;
    } else {
      destinationText = 'my trip';
    }

    return `${timeframe} in ${destinationText}`;
  };

  const validateStep2 = () => {
    const errors = {};

    if (formData.activities.length === 0) {
      errors.activities = 'Select at least one activity';
    }

    if (!Array.isArray(formData.accommodation) || formData.accommodation.length === 0) {
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
      const weatherData = formData.destinations.map(d => d.weather).filter(Boolean);
      const hasWeatherData = weatherData.length > 0;

      let avgTemp = 0;
      if (hasWeatherData) {
        const tempSum = weatherData.reduce((sum, w) => sum + (w.min_temp + w.max_temp) / 2, 0);
        avgTemp = tempSum / weatherData.length;
      }

      const weatherType = hasWeatherData
        ? avgTemp < settings.weather_sensitivity.cold_threshold
          ? 'cold'
          : avgTemp > settings.weather_sensitivity.hot_threshold
            ? 'hot'
            : 'mild'
        : 'unknown';

      // Calculate trip duration
      const calculateTripDuration = () => {
        let totalDays = 0;
        formData.destinations.forEach(destination => {
          const startDate = new Date(destination.start_date);
          const endDate = new Date(destination.end_date);
          const durationMs = endDate.getTime() - startDate.getTime();
          const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
          totalDays += days;
        });
        return totalDays;
      };

      // Generate database-driven suggestions based on user selections
      const generateDynamicSuggestions = async (
        weatherType, 
        selectedActivities, 
        selectedAccommodation, 
        selectedCompanions, 
        tripDuration,
      ) => {
        const warnings = [];
        const tips = [];
        let items = [];

        try {
          // Check for missing information and add warnings
          if (weatherType === 'unknown') {
            warnings.push('Weather data unavailable - using general recommendations');
          }
          if (!selectedActivities || selectedActivities.length === 0) {
            warnings.push('No activities selected - basic items only');
          }
          if (!selectedAccommodation || selectedAccommodation.length === 0) {
            warnings.push('Accommodation type not specified - using hotel defaults');
          }

          // Add travel tips
          if (tripDuration > 14) {
            tips.push(
              'For trips longer than 2 weeks, pack 7 days worth of underwear and socks, then do laundry every few days',
            );
          }

          // Helper functions for dynamic quantity adjustments
          const getClothingQuantity = baseQuantity => {
            if (tripDuration <= 3) return Math.max(1, Math.ceil(baseQuantity * 0.5));
            if (tripDuration <= 7) return baseQuantity;
            if (tripDuration <= 14) return Math.ceil(baseQuantity * 1.5);
            return Math.ceil(baseQuantity * 2);
          };

          const getUnderwearSocksQuantity = () => {
            if (tripDuration > 14) {
              return 7; // For trips > 2 weeks, pack 7 days worth and do laundry
            }
            return tripDuration; // For trips ≤ 2 weeks, pack 1 per day
          };

          // Fetch items from selected lists
          const allSelectedListNames = [
            ...selectedActivities,
            ...((selectedAccommodation || [])),
            ...selectedCompanions,
          ].filter(Boolean);

          const user = await User.me();
          const allItemsFromLists = [];

          // Fetch user's lists across all supported types once
          const [activityLists, accommodationLists, companionLists] = await Promise.all([
            List.filter({ owner_id: user.id, list_type: 'activity' }),
            List.filter({ owner_id: user.id, list_type: 'accommodation' }),
            List.filter({ owner_id: user.id, list_type: 'companion' }),
          ]);
          const allUserLists = [
            ...(activityLists || []),
            ...(accommodationLists || []),
            ...(companionLists || []),
          ];

          console.log('📋 User lists (all types):', allUserLists.map(l => ({ name: l.name, list_name: l.list_name, type: l.list_type, itemCount: l.items?.length || 0 })));

          // Collect items from selected lists
          for (const listName of allSelectedListNames) {
            const matchingList = allUserLists.find(l => l.list_name === listName);
            if (matchingList) {
              allItemsFromLists.push(...(matchingList.items || []));
            }
          }

          // Normalize items from lists to ensure required fields
          const normalizedItemsFromLists = (allItemsFromLists || []).map(item => ({
            name: item?.name ?? '',
            category: item?.category ?? 'additional',
            quantity:
              typeof item?.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0
                ? item.quantity
                : 1,
            is_packed: !!item?.is_packed,
            weather_dependent: !!item?.weather_dependent,
            emoji: item?.emoji,
          })).filter(i => i.name);

          // Essential items that adjust with trip length (these are universal)
          const essentialItems = [
            {
              name: 'Underwear',
              category: 'clothing',
              quantity: getUnderwearSocksQuantity(),
              is_packed: false,
              weather_dependent: false,
            },
            {
              name: 'Socks',
              category: 'clothing',
              quantity: getUnderwearSocksQuantity(),
              is_packed: false,
              weather_dependent: false,
            },
            {
              name: 'Phone Charger',
              category: 'tech',
              quantity: 1,
              is_packed: false,
              weather_dependent: false,
            },
            {
              name: 'Toothbrush',
              category: 'toiletries',
              quantity: 1,
              is_packed: false,
              weather_dependent: false,
            },
            {
              name: 'Toothpaste',
              category: 'toiletries',
              quantity: tripDuration > 7 ? 2 : 1,
              is_packed: false,
              weather_dependent: false,
            },
          ];

          // Weather-dependent items (these supplement the list items)
          const weatherItems = [];
          if (weatherType === 'cold') {
            weatherItems.push(
              {
                name: 'Thermal Underwear',
                category: 'clothing',
                quantity: getClothingQuantity(2),
                is_packed: false,
                weather_dependent: true,
              },
              {
                name: 'Warm Jacket',
                category: 'clothing',
                quantity: 1,
                is_packed: false,
                weather_dependent: true,
              },
              {
                name: 'Gloves',
                category: 'clothing',
                quantity: 1,
                is_packed: false,
                weather_dependent: true,
              },
            );
          } else if (weatherType === 'hot') {
            weatherItems.push(
              {
                name: 'Sunscreen',
                category: 'toiletries',
                quantity: tripDuration > 7 ? 2 : 1,
                is_packed: false,
                weather_dependent: true,
              },
              {
                name: 'Extra Sunglasses',
                category: 'essentials',
                quantity: 1,
                is_packed: false,
                weather_dependent: true,
              },
            );
          }

          // Rain gear based on precipitation probability
          const rainItems = [];
          const hasRainData = weatherData.some(w => w.rain_chance);
          if (hasRainData) {
            const rainChances = weatherData.map(w => w.rain_chance).filter(Boolean);
            const maxRainChance = rainChances.includes('strong')
              ? 'strong'
              : rainChances.includes('chance')
                ? 'chance' 
                : rainChances.includes('slight')
                  ? 'slight'
                  : 'none';

            if (maxRainChance === 'strong') {
              rainItems.push(
                {
                  name: 'Waterproof Jacket',
                  category: 'clothing',
                  quantity: 1,
                  is_packed: false,
                  weather_dependent: true,
                },
                {
                  name: 'Umbrella',
                  category: 'essentials',
                  quantity: 1,
                  is_packed: false,
                  weather_dependent: true,
                },
              );
            } else if (maxRainChance === 'chance') {
              rainItems.push({
                name: 'Light Rain Jacket',
                category: 'clothing',
                quantity: 1,
                is_packed: false,
                weather_dependent: true,
              });
            }
          }

          // Combine all items from database lists with essential and weather items
          const combinedItems = [
            ...normalizedItemsFromLists,
            ...essentialItems,
            ...weatherItems,
            ...rainItems,
          ];

          // Remove duplicates and apply quantity adjustments
          const itemMap = new Map();
          
          combinedItems.forEach(item => {
            const key = item.name.toLowerCase();
            if (itemMap.has(key)) {
              // If item already exists, keep the higher quantity
              const existing = itemMap.get(key);
              if (item.quantity > existing.quantity) {
                itemMap.set(key, item);
              }
            } else {
              // Apply trip duration adjustments to clothing items from lists
              const adjustedItem = { ...item };
              if (item.category === 'clothing' && item.quantity > 1) {
                adjustedItem.quantity = getClothingQuantity(item.quantity);
              }
              itemMap.set(key, adjustedItem);
            }
          });

          items = Array.from(itemMap.values());

          // Set warnings for missing info and travel tips
          setMissingInfoWarnings(warnings);
          setTravelTips(tips);

          return { items, warnings, tips };

        } catch (error) {
          console.error('Error generating suggestions from database:', error);
          warnings.push('Error loading list data - using basic fallback items');
          
          // Fallback to minimal essential items
          items = [
            {
              name: 'Underwear',
              category: 'clothing',
              quantity: Math.min(tripDuration, 7),
              is_packed: false,
              weather_dependent: false,
            },
            {
              name: 'Socks',
              category: 'clothing', 
              quantity: Math.min(tripDuration, 7),
              is_packed: false,
              weather_dependent: false,
            },
            {
              name: 'Phone Charger',
              category: 'tech',
              quantity: 1,
              is_packed: false,
              weather_dependent: false,
            },
          ];

          setMissingInfoWarnings(warnings);
          setTravelTips(tips);
          return { items, warnings, tips };
        }
      };

      const tripDuration = calculateTripDuration();

      const response = await generateDynamicSuggestions(
        weatherType,
        formData.activities,
        formData.accommodation,
        formData.companions,
        tripDuration,
      );

      const uniqueItems = [];
      const itemNames = new Set();
      const allItems = response.items || [];

      allItems.forEach(item => {
        if (!itemNames.has(item.name)) {
          item.is_packed = false;
          itemNames.add(item.name);
          uniqueItems.push(item);
        }
      });

      // Generate emojis for all items
      const itemsWithEmojis = await generateEmojisForItems(uniqueItems, formData.activities);

      setFormData(prev => ({
        ...prev,
        items: itemsWithEmojis,
      }));

      const generatedName = generateListName();
      console.log(
        'Generated name for list:',
        generatedName,
        'based on destinations:',
        formData.destinations,
      );
      setListName(generatedName);

      setStep(3);
    } catch (error) {
      console.error('Error generating packing list:', error);
      // Fallback to basic items if generation fails
      const fallbackItems = [
        {
          name: 'Underwear',
          category: 'clothing',
          quantity: 3,
          is_packed: false,
          weather_dependent: false,
        },
        {
          name: 'Socks',
          category: 'clothing',
          quantity: 3,
          is_packed: false,
          weather_dependent: false,
        },
        {
          name: 'T-Shirts',
          category: 'clothing',
          quantity: 2,
          is_packed: false,
          weather_dependent: false,
        },
        {
          name: 'Pants',
          category: 'clothing',
          quantity: 1,
          is_packed: false,
          weather_dependent: false,
        },
        {
          name: 'Phone Charger',
          category: 'tech',
          quantity: 1,
          is_packed: false,
          weather_dependent: false,
        },
        {
          name: 'Toothbrush',
          category: 'toiletries',
          quantity: 1,
          is_packed: false,
          weather_dependent: false,
        },
      ];
      
      // Generate emojis for fallback items
      const fallbackItemsWithEmojis = await generateEmojisForItems(fallbackItems, formData.activities);
      
      setFormData(prev => ({
        ...prev,
        items: fallbackItemsWithEmojis,
      }));
      setMissingInfoWarnings(['Error generating suggestions - using basic fallback items']);
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
        owner_id: user.id,
      });

      navigate(createPageUrl(`ListDetail?id=${list.id}`));
    } catch (error) {
      console.error('Error saving list:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper functions for floating next button
  const getNextButtonText = () => {
    if (step === 1) return 'Next';
    if (step === 2) return isProcessing ? 'Generating...' : 'Generate List';
    if (step === 3) return isProcessing ? 'Saving...' : 'Save Trip';
    return 'Next';
  };

  const canProceedToNext = () => {
    if (step === 1) return hasValidDestination;
    if (step === 2) return true; // Let validation happen in the handler
    if (step === 3) return true;
    return false;
  };

  const handleFloatingNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleStep2Next();
    } else if (step === 3) {
      saveList();
    }
  };

  const getWeatherIcon = conditions => {
    switch (conditions?.toLowerCase()) {
      case 'thunderstorm':
        return <Cloud className="w-5 h-5 text-gray-600" />;
      case 'drizzle':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'snow':
        return <Cloud className="w-5 h-5 text-blue-200" />;
      case 'clouds':
        return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'clear':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      default:
        return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getRainChanceDisplay = (rainChance, precipProbability) => {
    const rainChanceConfig = {
      slight: { label: 'Slight Chance', color: 'text-yellow-600', icon: '🌦️' },
      chance: { label: 'Good Chance', color: 'text-orange-600', icon: '🌧️' },
      strong: { label: 'Strong chance', color: 'text-red-600', icon: '☔️' },
    };

    const config = rainChanceConfig[rainChance];
    return config
      ? {
          ...config,
          percentage: precipProbability || 0,
        }
      : null;
  };

  const removeItem = itemToRemove => {
    const newItems = formData.items.filter(item => item !== itemToRemove);
    setFormData({ ...formData, items: newItems });
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <LottieSpinner
          size={120}
          color="#3b82f6"
        />
        <p className="mt-4 text-gray-600">Creating your packing list...</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => {
                if (step === 1) {
                  navigate(createPageUrl('Home'));
                } else {
                  setStep(step - 1);
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-2xl font-bold">Create a New Trip</h1>
          </div>
          <p className="text-gray-500 ml-11">Let us help you prepare for your journey</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            {/* Progress Line Background */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200"></div>

            {/* Active Progress Line */}
            <div
              className="absolute top-4 left-8 h-0.5 bg-blue-600 transition-all duration-300"
              style={{
                width: step === 1 ? '0%' : step === 2 ? 'calc(50% - 2rem)' : 'calc(100% - 4rem)',
              }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between items-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                    font-semibold transition-colors duration-200 ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  1
                </div>
                <span className="text-xs mt-2 font-medium text-gray-600">Destinations</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                    font-semibold transition-colors duration-200 ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
                <span className="text-xs mt-2 font-medium text-gray-600">Details</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                    font-semibold transition-colors duration-200 ${
                    step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  3
                </div>
                <span className="text-xs mt-2 font-medium text-gray-600">Review</span>
              </div>
            </div>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Where are you going?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {formData.destinations.map((destination, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg relative"
                >
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDestination(index)}
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`destination-${index}`}>
                        {formData.destinations.length > 1
                          ? `Destination ${index + 1}`
                          : 'Destination'}
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`destination-${index}`}
                          placeholder="Search for a destination"
                          className="pl-9"
                          value={destination.location}
                          onChange={e => {
                            const newDestinations = [...formData.destinations];
                            newDestinations[index] = {
                              ...newDestinations[index],
                              location: e.target.value,
                            };

                            if (!e.target.value.trim()) {
                              newDestinations[index].coordinates = null;
                            }

                            setFormData(prev => ({
                              ...prev,
                              destinations: newDestinations,
                            }));
                          }}
                          ref={el => (inputRefs.current[index] = el)}
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
                                {format(destination.start_date, 'MMM d')}
                                {' — '}
                                {format(destination.end_date, 'MMM d, yyyy')}
                              </span>
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                        >
                          <DateRange
                            ranges={[{
                              startDate: destination.start_date,
                              endDate: destination.end_date,
                              key: 'selection',
                            }]}
                            onChange={(ranges) => handleDateRangeChange(index, ranges)}
                            minDate={
                              index === 0
                                ? new Date()
                                : formData.destinations[index - 1].end_date
                            }
                            direction="horizontal"
                            showDateDisplay={false}
                            rangeColors={['#3b82f6']}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {destination.weather && (
                      <div className={`mt-2 p-3 rounded-lg ${
                        destination.weather.isApproximate ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getWeatherIcon(destination.weather.conditions)}
                            <span className="text-sm font-medium">
                              {destination.weather.conditions}
                            </span>
                            {destination.weather.isApproximate && (
                              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
                                Estimate
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span className="text-sm">
                              {destination.weather.min_temp}°C - {destination.weather.max_temp}°C
                            </span>
                          </div>
                        </div>
                        {destination.weather.rain_chance &&
                          destination.weather.rain_chance !== 'none' &&
                          getRainChanceDisplay(
                            destination.weather.rain_chance,
                            destination.weather.precipitation_probability,
                          ) && (
                            <div className={`flex items-center gap-1 pt-2 border-t ${
                              destination.weather.isApproximate ? 'border-amber-200' : 'border-blue-200'
                            }`}>
                              <span className="text-sm">
                                {
                                  getRainChanceDisplay(
                                    destination.weather.rain_chance,
                                    destination.weather.precipitation_probability,
                                  ).icon
                                }
                              </span>
                              <span
                                className={`text-sm font-medium ${getRainChanceDisplay(destination.weather.rain_chance, destination.weather.precipitation_probability).color}`}
                              >
                                Rain:{' '}
                                {
                                  getRainChanceDisplay(
                                    destination.weather.rain_chance,
                                    destination.weather.precipitation_probability,
                                  ).label
                                }{' '}
                                ({destination.weather.precipitation_probability}%)
                              </span>
                            </div>
                          )}
                        {destination.weather.warning && (
                          <div className="mt-2 p-2 bg-amber-100 border-l-4 border-amber-500 rounded">
                            <p className="text-xs text-amber-800">
                              ⚠️ {destination.weather.warning}
                            </p>
                          </div>
                        )}
                        {destination.weather.poweredBy && (
                          <div className="mt-1 text-xs text-gray-500">
                            {destination.weather.poweredBy}
                          </div>
                        )}
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
                className="w-full h-52 rounded-lg border"
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
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LottieSpinner size={60} color="#3b82f6" />
                  <span className="ml-3 text-gray-600">Loading trip options...</span>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="block mb-3">What activities are you planning?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {activities.map(activity => (
                    <div
                      key={activity.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${
                          formData.activities.includes(activity.id)
                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                            : 'hover:bg-gray-50'
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
                  {accommodationOptions.map(option => (
                    <div
                      key={option.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${
                          formData.accommodation.includes(option.id)
                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                            : 'hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleAccommodationToggle(option.id)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                        {formData.accommodation.includes(option.id) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
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
                  {companionOptions.map(option => (
                    <div
                      key={option.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${
                          formData.companions.includes(option.id)
                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                            : 'hover:bg-gray-50'
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
                  {amenities.map(amenity => (
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
                </>
              )}
            </CardContent>
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
                      onChange={e => setListName(e.target.value)}
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
                {missingInfoWarnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">Missing Information</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {missingInfoWarnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {travelTips.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">💡 Travel Tips</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      {travelTips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-1">Trip Summary</h3>
                  <div className="space-y-2">
                    {formData.destinations.map((destination, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{destination.location}</p>
                          <p className="text-sm text-gray-600">
                            {format(destination.start_date, 'MMM d')} -{' '}
                            {format(destination.end_date, 'MMM d, yyyy')}
                          </p>
                        </div>
                        {destination.weather && (
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            destination.weather.isApproximate 
                              ? 'bg-amber-100 border border-amber-300' 
                              : 'bg-white'
                          }`}>
                            {getWeatherIcon(destination.weather.conditions)}
                            <span className="font-medium">
                              {destination.weather.min_temp}° - {destination.weather.max_temp}°C
                            </span>
                            {destination.weather.isApproximate && (
                              <span className="text-xs text-amber-700 font-semibold">~</span>
                            )}
                            {destination.weather.rain_chance &&
                              destination.weather.rain_chance !== 'none' && (
                                <span className="text-xs">
                                  {getRainChanceDisplay(
                                    destination.weather.rain_chance,
                                    destination.weather.precipitation_probability,
                                  )?.icon || ''}
                                </span>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Array.isArray(formData.accommodation) && formData.accommodation.length > 0 && (
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs">
                        <span className="font-medium">Staying at:</span>
                        <span className="flex gap-1 flex-wrap">
                          {formData.accommodation.map(acc => {
                            const label = accommodationOptions.find(a => a.id === acc)?.label || acc;
                            return (
                              <span key={acc} className="capitalize">{label}</span>
                            );
                          })}
                        </span>
                      </div>
                    )}
                    {formData.activities.map(activity => (
                      <span
                        key={activity}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {activity}
                      </span>
                    ))}
                    {formData.companions.map(companion => (
                      <span
                        key={companion}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                      >
                        {companion}
                      </span>
                    ))}
                  </div>
                </div>

                {formData.destinations.some(d => d.weather) && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Weather-Based Recommendations</h3>
                    <div className="text-sm text-gray-600">
                      {formData.destinations.some(
                        d =>
                          d.weather &&
                          d.weather.min_temp <= settings.weather_sensitivity.cold_threshold,
                      ) && (
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="text-blue-500 w-4 h-4" />
                          <span>Pack warm clothing for cold weather.</span>
                        </div>
                      )}
                      {formData.destinations.some(
                        d =>
                          d.weather &&
                          d.weather.min_temp > settings.weather_sensitivity.hot_threshold,
                      ) && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="text-orange-500 w-4 h-4" />
                          <span>Pack light, breathable clothing for hot weather.</span>
                        </div>
                      )}
                      {formData.destinations.some(
                        d => d.weather && d.weather.rain_chance && d.weather.rain_chance !== 'none',
                      ) && (
                        <div className="flex items-center gap-2">
                          <CloudRain className="text-blue-500 w-4 h-4" />
                          <span>
                            {formData.destinations.some(
                              d => d.weather && d.weather.rain_chance === 'strong',
                            )
                              ? 'Rain is very likely - pack waterproof gear!'
                              : formData.destinations.some(
                                    d => d.weather && d.weather.rain_chance === 'chance',
                                  )
                                ? 'Good chance of rain - consider bringing rain gear.'
                                : 'Slight chance of rain - might want to pack a light jacket.'}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Weather service disclaimers */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-1">
                        {formData.destinations
                          .filter(d => d.weather?.poweredBy)
                          .reduce((unique, dest) => {
                            if (!unique.find(u => u.poweredBy === dest.weather.poweredBy)) {
                              unique.push(dest.weather);
                            }
                            return unique;
                          }, [])
                          .map((weather, index) => (
                            <div key={index} className="text-xs text-gray-500">
                              {weather.poweredBy}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {['clothing', 'toiletries', 'tech', 'gear', 'essentials'].map(category => {
                  const categoryItems = formData.items.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="font-semibold capitalize mb-2">{category}</h3>
                      <div className="border rounded-lg divide-y">
                        {categoryItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {item.name}
                                {item.weather_dependent && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    Weather
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">x{item.quantity}</span>
                              <button
                                onClick={() => removeItem(item)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Next Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleFloatingNext}
          disabled={!canProceedToNext() || isProcessing}
          className="h-14 w-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
        {!isProcessing && (
          <div className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {getNextButtonText()}
          </div>
        )}
      </div>
    </div>
  );
}
