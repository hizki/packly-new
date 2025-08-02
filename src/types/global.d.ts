/**
 * Global type declarations for external libraries and APIs
 */

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }

  // Google Maps API types
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
      }

      class Marker {
        constructor(opts?: MarkerOptions);
        setMap(map: Map | null): void;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        rotateControl?: boolean;
        tiltControl?: boolean;
        gestureHandling?: string;
        disableDefaultUI?: boolean;
        fullscreenControl?: boolean;
        zoomControl?: boolean;
        keyboardShortcuts?: boolean;
        clickableIcons?: boolean;
        restriction?: MapRestriction;
        minZoom?: number;
        maxZoom?: number;
      }

      interface MapRestriction {
        latLngBounds: LatLngBoundsLiteral;
        strictBounds?: boolean;
      }

      interface LatLngBoundsLiteral {
        north: number;
        south: number;
        west: number;
        east: number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        title?: string;
        icon?: string | Icon | Symbol;
      }

      interface Icon {
        path: string | SymbolPath;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      interface Symbol {
        path: string | SymbolPath;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      enum SymbolPath {
        CIRCLE = 0,
      }

      namespace places {
        class Autocomplete {
          constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
          addListener(eventName: string, handler: () => void): void;
          getPlace(): PlaceResult;
        }

        interface AutocompleteOptions {
          types?: string[];
          fields?: string[];
        }

        interface PlaceResult {
          address_components?: AddressComponent[];
          geometry?: Geometry;
          name?: string;
          formatted_address?: string;
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }

        interface Geometry {
          location: LatLng;
          viewport?: LatLngBounds;
        }

        interface LatLngBounds {
          getNorthEast(): LatLng;
          getSouthWest(): LatLng;
        }
      }

      namespace event {
        function clearInstanceListeners(instance: any): void;
      }
    }
  }
}

// Extend ImportMeta interface for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_WEATHER_API_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
