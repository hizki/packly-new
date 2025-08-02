import React from 'react';
// @ts-ignore - UI components are still jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// @ts-ignore - UI components are still jsx
import { Button } from '@/components/ui/button';
// @ts-ignore - UI components are still jsx
import { Input } from '@/components/ui/input';
// @ts-ignore - UI components are still jsx
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Sun, CloudRain, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import type {
  Destination,
  PackingItem,
  ActivityType,
  AccommodationType,
  CompanionType,
  UserSettings,
  Option,
} from '@/types';

/**
 * Props interface for the ReviewStep component
 */
export interface ReviewStepProps {
  /** Trip name */
  listName: string;
  /** Whether trip name is being edited */
  isEditingName: boolean;
  /** Destinations */
  destinations: Destination[];
  /** Accommodation type */
  accommodation: AccommodationType;
  /** Selected activities */
  activities: ActivityType[];
  /** Selected companions */
  companions: CompanionType[];
  /** Packing items */
  items: PackingItem[];
  /** Missing information warnings */
  missingInfoWarnings: string[];
  /** Travel tips */
  travelTips: string[];
  /** User settings */
  settings: UserSettings;
  /** Callback when trip name changes */
  onNameChange: (name: string) => void;
  /** Callback when editing name state changes */
  onEditingNameChange: (editing: boolean) => void;
  /** Callback when item is removed */
  onRemoveItem: (item: PackingItem) => void;
}

/**
 * Component for reviewing trip details before saving.
 * Shows trip summary, warnings, tips, and allows final edits.
 */
export default function ReviewStep({
  listName,
  isEditingName,
  destinations,
  accommodation,
  activities,
  companions,
  items,
  missingInfoWarnings,
  travelTips,
  settings,
  onNameChange,
  onEditingNameChange,
  onRemoveItem,
}: ReviewStepProps) {
  /** Accommodation options for display */
  const accommodationOptions: Option<AccommodationType>[] = [
    { id: 'hotel', label: 'Hotel' },
    { id: 'camping', label: 'Camping' },
    { id: 'glamping', label: 'Glamping' },
    { id: 'couch_surfing', label: 'Couch Surfing' },
    { id: 'airbnb', label: 'Airbnb' },
  ];

  /**
   * Gets weather icon based on conditions
   */
  const getWeatherIcon = (conditions?: string) => {
    if (!conditions) return null;

    switch (conditions.toLowerCase()) {
      case 'clear':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'clouds':
        return <span className="text-lg">☁️</span>;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      default:
        return <span className="text-lg">🌤️</span>;
    }
  };

  /**
   * Gets rain chance display
   */
  const getRainChanceDisplay = (rainChance?: string, precipProbability?: number) => {
    const rainChanceConfig = {
      slight: { icon: '🌦️' },
      chance: { icon: '🌧️' },
      certain: { icon: '☔️' },
    };

    if (!rainChance || rainChance === 'none') return null;

    const config = rainChanceConfig[rainChance as keyof typeof rainChanceConfig];
    return config?.icon || '';
  };

  /**
   * Groups items by category
   */
  const getItemsByCategory = () => {
    const categories = ['clothing', 'toiletries', 'tech', 'gear', 'essentials'] as const;
    return categories.reduce(
      (acc, category) => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          acc[category] = categoryItems;
        }
        return acc;
      },
      {} as Record<string, PackingItem[]>
    );
  };

  const itemsByCategory = getItemsByCategory();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          {isEditingName ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={listName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
                className="text-xl font-bold"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => onEditingNameChange(false)}
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
                onClick={() => onEditingNameChange(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardTitle>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          {/* Missing Information Warnings */}
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

          {/* Travel Tips */}
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

          {/* Trip Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-1">Trip Summary</h3>
            <div className="space-y-2">
              {destinations.map((destination, index) => (
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
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm">
                      {getWeatherIcon(destination.weather.conditions)}
                      <span className="font-medium">
                        {destination.weather.min_temp}° - {destination.weather.max_temp}°C
                      </span>
                      {destination.weather.rain_chance &&
                        destination.weather.rain_chance !== 'none' && (
                          <span className="text-xs">
                            {getRainChanceDisplay(
                              destination.weather.rain_chance,
                              destination.weather.precipitation_probability
                            )}
                          </span>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs">
                <span className="font-medium">Staying at:</span>
                <span>{accommodationOptions.find(a => a.id === accommodation)?.label}</span>
              </div>
              {activities.map(activity => (
                <span
                  key={activity}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {activity}
                </span>
              ))}
              {companions.map(companion => (
                <span
                  key={companion}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                >
                  {companion}
                </span>
              ))}
            </div>
          </div>

          {/* Weather-Based Recommendations */}
          {destinations.some(d => d.weather) && (
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Weather-Based Recommendations</h3>
              <div className="text-sm text-gray-600">
                {destinations.some(
                  d =>
                    d.weather &&
                    d.weather.min_temp <= (settings.weather_sensitivity?.cold_threshold || 15)
                ) && (
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="text-blue-500 w-4 h-4" />
                    <span>Pack warm clothing for cold weather.</span>
                  </div>
                )}
                {destinations.some(
                  d =>
                    d.weather &&
                    d.weather.min_temp > (settings.weather_sensitivity?.hot_threshold || 25)
                ) && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="text-orange-500 w-4 h-4" />
                    <span>Pack light, breathable clothing for hot weather.</span>
                  </div>
                )}
                {destinations.some(
                  d => d.weather && d.weather.rain_chance && d.weather.rain_chance !== 'none'
                ) && (
                  <div className="flex items-center gap-2">
                    <CloudRain className="text-blue-500 w-4 h-4" />
                    <span>
                      {destinations.some(d => d.weather && d.weather.rain_chance === 'certain')
                        ? 'Rain is very likely - pack waterproof gear!'
                        : destinations.some(d => d.weather && d.weather.rain_chance === 'chance')
                          ? 'Good chance of rain - consider bringing rain gear.'
                          : 'Slight chance of rain - might want to pack a light jacket.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Packing Items by Category */}
        <div className="space-y-4">
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
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
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs"
                          >
                            Weather
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">x{item.quantity}</span>
                      <button
                        onClick={() => onRemoveItem(item)}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
