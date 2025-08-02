import { useRef, useEffect, useCallback } from 'react';
import type { Destination, LoadingState } from '@/types';

/**
 * Props for the Google Maps hook
 */
interface UseGoogleMapsProps {
  /** Current destinations */
  destinations: Destination[];
  /** Callback when destinations are updated */
  onDestinationsUpdate: (destinations: Destination[]) => void;
  /** Callback when weather loading state changes */
  onWeatherLoadingChange: (loading: LoadingState) => void;
  /** Current weather loading state */
  weatherLoading: LoadingState;
}

/**
 * Custom hook for managing Google Maps functionality
 * Handles map initialization, autocomplete, and weather fetching
 */
export function useGoogleMaps({
  destinations,
  onDestinationsUpdate,
  onWeatherLoadingChange,
  weatherLoading,
}: UseGoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const autocompleteRefs = useRef<google.maps.places.Autocomplete[]>([]);
  const mapsApiKeyRef = useRef(import.meta.env['VITE_GOOGLE_MAPS_API_KEY']);
  const weatherApiKeyRef = useRef(import.meta.env['VITE_WEATHER_API_KEY']);

  /**
   * Fetches weather data for a destination
   */
  const fetchWeatherForDestination = useCallback(
    async (index: number, coordinates: { lat: number; lng: number }) => {
      if (!coordinates || !weatherApiKeyRef.current) return;

      onWeatherLoadingChange({ ...weatherLoading, [index]: true });

      try {
        const [currentResponse, forecastResponse] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&appid=${weatherApiKeyRef.current}`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&appid=${weatherApiKeyRef.current}`
          ),
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        if (currentData && forecastData && forecastData.list && forecastData.list.length > 0) {
          const currentWeather = currentData;
          const nextForecast = forecastData.list[0];

          // Calculate rain chance category based on precipitation probability
          const getRainChanceCategory = (pop: number) => {
            if (pop === 0) return 'none';
            if (pop <= 0.3) return 'slight';
            if (pop <= 0.7) return 'chance';
            return 'certain';
          };

          const rainChance = getRainChanceCategory(nextForecast.pop || 0);

          const newDestinations = [...destinations];
          const existingDestination = newDestinations[index];

          if (existingDestination) {
            newDestinations[index] = {
              ...existingDestination,
              weather: {
                min_temp: Math.round(currentWeather.main.temp_min),
                max_temp: Math.round(currentWeather.main.temp_max),
                conditions: currentWeather.weather[0]?.main || 'Unknown',
                description: currentWeather.weather[0]?.description,
                precipitation_probability: Math.round((nextForecast.pop || 0) * 100),
                rain_chance: rainChance,
              },
            };

            onDestinationsUpdate(newDestinations);
          }
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        onWeatherLoadingChange({ ...weatherLoading, [index]: false });
      }
    },
    [destinations, onDestinationsUpdate, onWeatherLoadingChange, weatherLoading]
  );

  /**
   * Gets user's current location and centers map
   */
  const getUserLocation = useCallback((map: google.maps.Map) => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    const handleLocationError = (error: GeolocationPositionError) => {
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

          new google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Your location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
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
      }
    );
  }, []);

  /**
   * Initializes the Google Map and autocomplete instances
   */
  const initializeMapAndAutocomplete = useCallback(() => {
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
          mapTypeControl: false,
          streetViewControl: false,
          rotateControl: false,
          tiltControl: false,
          gestureHandling: 'greedy',
          disableDefaultUI: false,
          fullscreenControl: true,
          zoomControl: true,
          keyboardShortcuts: false,
          clickableIcons: false,
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

        mapInstance.current = map;
        getUserLocation(map);
      }

      const map = mapInstance.current;
      const markers: google.maps.Marker[] = [];

      // Add markers for existing destinations with coordinates
      destinations.forEach(destination => {
        if (destination.coordinates && destination.location) {
          const marker = new window.google.maps.Marker({
            position: destination.coordinates,
            map: map,
            title: destination.location,
          });
          markers.push(marker);
        }
      });

      // Initialize autocomplete for each destination input
      destinations.forEach((destination, index) => {
        const inputElement = document.getElementById(`destination-${index}`) as HTMLInputElement;
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

          autocompleteRefs.current[index] = autocomplete;
          inputElement.setAttribute('data-autocomplete-initialized', 'true');

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            const locationName = place.name || place.formatted_address || inputElement.value;

            const newDestinations = [...destinations];
            const existingDestination = newDestinations[index];

            if (existingDestination) {
              newDestinations[index] = {
                ...existingDestination,
                location: locationName,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                },
              };

              onDestinationsUpdate(newDestinations);
              map.setCenter(place.geometry.location);
              map.setZoom(12);

              fetchWeatherForDestination(index, {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            }
          });
        } catch (autocompleteError) {
          console.error('Error creating autocomplete for input', index, autocompleteError);
          inputElement.removeAttribute('data-autocomplete-initialized');
        }
      });
    } catch (mapError) {
      console.error('Error initializing Google Maps:', mapError);
    }
  }, [destinations, onDestinationsUpdate, fetchWeatherForDestination, getUserLocation]);

  /**
   * Initializes Google Maps script and loads the API
   */
  const initializeGoogleMaps = useCallback(() => {
    console.log('Initializing Google Maps...');

    if (!mapsApiKeyRef.current || mapsApiKeyRef.current === 'your_google_maps_api_key') {
      console.warn('Google Maps API key not configured');
      return;
    }

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
      setTimeout(initializeMapAndAutocomplete, 100);
    };

    script.onerror = error => {
      console.error('Error loading Google Maps:', error);
      const failedScript = document.getElementById('google-maps-script');
      if (failedScript) {
        failedScript.remove();
      }
    };

    document.body.appendChild(script);
  }, [initializeMapAndAutocomplete]);

  /**
   * Cleanup function for Google Maps components
   */
  const cleanupGoogleMapsComponents = useCallback(() => {
    autocompleteRefs.current.forEach(autocomplete => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    });
    autocompleteRefs.current = [];

    const pacContainers = document.querySelectorAll('.pac-container');
    pacContainers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    destinations.forEach((_, index) => {
      const inputElement = document.getElementById(`destination-${index}`);
      if (inputElement) {
        inputElement.removeAttribute('data-autocomplete-initialized');
      }
    });

    if (mapInstance.current) {
      mapInstance.current = null;
    }
  }, [destinations]);

  // Initialize Google Maps on mount
  useEffect(() => {
    const timeoutId = setTimeout(initializeGoogleMaps, 100);
    return () => {
      clearTimeout(timeoutId);
      cleanupGoogleMapsComponents();
    };
  }, [initializeGoogleMaps, cleanupGoogleMapsComponents]);

  // Reinitialize when destinations length changes
  useEffect(() => {
    if (mapRef.current && window.google) {
      const timeoutId = setTimeout(initializeMapAndAutocomplete, 200);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [destinations.length, initializeMapAndAutocomplete]);

  return {
    mapRef,
    initializeGoogleMaps,
    cleanupGoogleMapsComponents,
    fetchWeatherForDestination,
  };
}
