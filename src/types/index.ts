/**
 * Common type definitions for the Packly application
 */

/** User interface representing authenticated users */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  has_initialized_base_lists?: boolean;
  settings?: UserSettings;
}

/** User settings interface */
export interface UserSettings {
  notifications?: boolean;
  theme?: 'light' | 'dark';
  weather_sensitivity?: WeatherSensitivity;
}

/** Weather sensitivity thresholds */
export interface WeatherSensitivity {
  cold_threshold: number;
  hot_threshold: number;
}

/** Weather data interface */
export interface Weather {
  min_temp: number;
  max_temp: number;
  conditions: string;
  description?: string;
  precipitation_probability?: number;
  rain_chance?: 'none' | 'slight' | 'chance' | 'strong';
  isApproximate?: boolean;
  source?: string;
  poweredBy?: string;
  warning?: string;
  error?: string;
}

/** Geographic coordinates */
export interface Coordinates {
  lat: number;
  lng: number;
}

/** Flight details interface */
export interface FlightDetails {
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  departure_airport?: string;
  arrival_airport?: string;
}

/** Destination interface */
export interface Destination {
  location: string;
  start_date: Date;
  end_date: Date;
  coordinates: Coordinates | null;
  weather: Weather | null;
  flight?: FlightDetails;
  date_range?: {
    from: Date;
    to: Date;
  };
}

/** Packing list item interface */
export interface PackingItem {
  name: string;
  category: 'clothing' | 'toiletries' | 'tech' | 'gear' | 'essentials' | 'additional';
  quantity: number;
  is_packed: boolean;
  weather_dependent: boolean;
}

/** Accommodation types */
export type AccommodationType = 'hotel' | 'camping' | 'glamping' | 'couch_surfing' | 'airbnb';

/** Activity types */
export type ActivityType =
  | 'beach'
  | 'camping'
  | 'climbing'
  | 'hiking'
  | 'partying'
  | 'business'
  | 'sightseeing';

/** Companion types */
export type CompanionType = 'alone' | 'spouse' | 'friends' | 'family';

/** Amenity types */
export type AmenityType = 'laundry' | 'gym' | 'pool' | 'kitchen';

/** Packing list interface */
export interface PackingList {
  id: string;
  name: string;
  owner_id: string;
  destinations?: Destination[];
  destination?: string; // Legacy field
  start_date?: Date; // Legacy field
  end_date?: Date; // Legacy field
  activities: ActivityType[];
  accommodation: AccommodationType;
  companions: CompanionType[];
  amenities: AmenityType[];
  items: PackingItem[];
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Tip interface */
export interface Tip {
  id: string;
  content: string;
  is_default: boolean;
  order: number;
}

/** Tip list interface */
export interface TipList {
  id: string;
  list_type: 'day_before' | 'before_leaving';
  owner_id: string;
  tips: Tip[];
}

/** Form data interface for new list creation */
export interface NewListFormData {
  destinations: Destination[];
  activities: ActivityType[];
  accommodation: AccommodationType;
  companions: CompanionType[];
  amenities: AmenityType[];
  items: PackingItem[];
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

/** Option interface for UI components */
export interface Option<T = string> {
  id: T;
  label: string;
  icon?: string;
}

/** Loading state interface */
export interface LoadingState {
  [key: string]: boolean;
}

/** Validation errors interface */
export interface ValidationErrors {
  [field: string]: string;
}
