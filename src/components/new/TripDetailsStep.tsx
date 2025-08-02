import React from 'react';
// @ts-ignore - UI components are still jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// @ts-ignore - UI components are still jsx
import { Label } from '@/components/ui/label';
// @ts-ignore - UI components are still jsx
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import type {
  ActivityType,
  AccommodationType,
  CompanionType,
  AmenityType,
  Option,
  ValidationErrors,
} from '@/types';

/**
 * Props interface for the TripDetailsStep component
 */
export interface TripDetailsStepProps {
  /** Selected activities */
  activities: ActivityType[];
  /** Selected accommodation type */
  accommodation: AccommodationType;
  /** Selected companions */
  companions: CompanionType[];
  /** Selected amenities */
  amenities: AmenityType[];
  /** Callback when activities change */
  onActivitiesChange: (activities: ActivityType[]) => void;
  /** Callback when accommodation changes */
  onAccommodationChange: (accommodation: AccommodationType) => void;
  /** Callback when companions change */
  onCompanionsChange: (companions: CompanionType[]) => void;
  /** Callback when amenities change */
  onAmenitiesChange: (amenities: AmenityType[]) => void;
  /** Validation errors */
  validationErrors: ValidationErrors;
}

/**
 * Component for collecting trip details in the trip creation flow.
 * Handles activity selection, accommodation, companions, and amenities.
 */
export default function TripDetailsStep({
  activities,
  accommodation,
  companions,
  amenities,
  onActivitiesChange,
  onAccommodationChange,
  onCompanionsChange,
  onAmenitiesChange,
  validationErrors,
}: TripDetailsStepProps) {
  /** Available activity options */
  const activityOptions: Option<ActivityType>[] = [
    { id: 'beach', label: 'Beach', icon: '🏖️' },
    { id: 'camping', label: 'Camping', icon: '🏕️' },
    { id: 'climbing', label: 'Climbing', icon: '🧗' },
    { id: 'hiking', label: 'Hiking', icon: '🥾' },
    { id: 'partying', label: 'Partying', icon: '🎉' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
  ];

  /** Available accommodation options */
  const accommodationOptions: Option<AccommodationType>[] = [
    { id: 'hotel', label: 'Hotel', icon: '🏨' },
    { id: 'camping', label: 'Camping', icon: '🏕️' },
    { id: 'glamping', label: 'Glamping', icon: '⛺' },
    { id: 'couch_surfing', label: 'Couch Surfing', icon: '🛋️' },
    { id: 'airbnb', label: 'Airbnb', icon: '🏠' },
  ];

  /** Available companion options */
  const companionOptions: Option<CompanionType>[] = [
    { id: 'alone', label: 'Alone', icon: '🧍' },
    { id: 'spouse', label: 'Spouse/Partner', icon: '💑' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  ];

  /** Available amenity options */
  const amenityOptions: Option<AmenityType>[] = [
    { id: 'laundry', label: 'Laundry' },
    { id: 'gym', label: 'Gym' },
    { id: 'pool', label: 'Pool' },
    { id: 'kitchen', label: 'Kitchen' },
  ];

  /**
   * Handles activity selection toggle
   */
  const handleActivityToggle = (activityId: ActivityType) => {
    if (activities.includes(activityId)) {
      onActivitiesChange(activities.filter(id => id !== activityId));
    } else {
      onActivitiesChange([...activities, activityId]);
    }
  };

  /**
   * Handles companion selection toggle
   */
  const handleCompanionToggle = (companionId: CompanionType) => {
    if (companions.includes(companionId)) {
      onCompanionsChange(companions.filter(id => id !== companionId));
    } else {
      onCompanionsChange([...companions, companionId]);
    }
  };

  /**
   * Handles amenity selection toggle
   */
  const handleAmenityToggle = (amenityId: AmenityType) => {
    if (amenities.includes(amenityId)) {
      onAmenitiesChange(amenities.filter(id => id !== amenityId));
    } else {
      onAmenitiesChange([...amenities, amenityId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Activities Section */}
        <div>
          <Label className="block mb-3">What activities are you planning?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {activityOptions.map(activity => (
              <div
                key={activity.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    activities.includes(activity.id)
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                      : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleActivityToggle(activity.id)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{activity.icon}</span>
                  <span className="text-sm font-medium">{activity.label}</span>
                  {activities.includes(activity.id) && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
            ))}
          </div>
          {validationErrors['activities'] && (
            <p className="text-sm text-red-500 mt-2">{validationErrors['activities']}</p>
          )}
        </div>

        {/* Accommodation Section */}
        <div>
          <Label className="block mb-3">Where are you staying?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {accommodationOptions.map(option => (
              <div
                key={option.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    accommodation === option.id
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                      : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => onAccommodationChange(option.id)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
          {validationErrors['accommodation'] && (
            <p className="text-sm text-red-500 mt-2">{validationErrors['accommodation']}</p>
          )}
        </div>

        {/* Companions Section */}
        <div>
          <Label className="block mb-3">Who are you traveling with?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {companionOptions.map(option => (
              <div
                key={option.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    companions.includes(option.id)
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                      : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleCompanionToggle(option.id)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                  {companions.includes(option.id) && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
            ))}
          </div>
          {validationErrors['companions'] && (
            <p className="text-sm text-red-500 mt-2">{validationErrors['companions']}</p>
          )}
        </div>

        {/* Amenities Section */}
        <div>
          <Label className="block mb-3">Available amenities at your destination</Label>
          <div className="grid grid-cols-2 gap-3">
            {amenityOptions.map(amenity => (
              <div
                key={amenity.id}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={amenity.id}
                  checked={amenities.includes(amenity.id)}
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
    </Card>
  );
}
