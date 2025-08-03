import React, { useState, useEffect } from 'react';
// @ts-ignore - UI components are still jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// @ts-ignore - UI components are still jsx
import { Label } from '@/components/ui/label';
// @ts-ignore - UI components are still jsx
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
// @ts-ignore - entities file is still js
import { ListType } from '@/api/entities';
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
  const [activityOptions, setActivityOptions] = useState<Option<ActivityType>[]>([]);
  const [accommodationOptions, setAccommodationOptions] = useState<Option<AccommodationType>[]>([]);
  const [companionOptions, setCompanionOptions] = useState<Option<CompanionType>[]>([]);
  const [loading, setLoading] = useState(true);

  /** Available amenity options - these are less dynamic */
  const amenityOptions: Option<AmenityType>[] = [
    { id: 'laundry', label: 'Laundry' },
    { id: 'gym', label: 'Gym' },
    { id: 'pool', label: 'Pool' },
    { id: 'kitchen', label: 'Kitchen' },
  ];

  useEffect(() => {
    loadListTypes();
  }, []);

  const loadListTypes = async () => {
    try {
      setLoading(true);
      
      // Load dynamic list types from database
      const [activityTypes, accommodationTypes, companionTypes] = await Promise.all([
        ListType.getByTypeGroup('activity'),
        ListType.getByTypeGroup('accommodation'),
        ListType.getByTypeGroup('companion'),
      ]);

             setActivityOptions(
         activityTypes.map((type: any) => ({
           id: type.list_name as ActivityType,
           label: type.display_name,
           icon: type.icon,
         }))
       );

       setAccommodationOptions(
         accommodationTypes.map((type: any) => ({
           id: type.list_name as AccommodationType,
           label: type.display_name,
           icon: type.icon,
         }))
       );

       setCompanionOptions(
         companionTypes.map((type: any) => ({
           id: type.list_name as CompanionType,
           label: type.display_name,
           icon: type.icon,
         }))
       );
    } catch (error) {
      console.error('Error loading list types:', error);
      // Fallback to hardcoded options if loading fails
      setActivityOptions([
        { id: 'beach', label: 'Beach', icon: '🏖️' },
        { id: 'camping', label: 'Camping', icon: '🏕️' },
        { id: 'hiking', label: 'Hiking', icon: '🥾' },
      ]);
      setAccommodationOptions([
        { id: 'hotel', label: 'Hotel', icon: '🏨' },
        { id: 'camping', label: 'Camping', icon: '🏕️' },
        { id: 'airbnb', label: 'Airbnb', icon: '🏠' },
      ]);
      setCompanionOptions([
        { id: 'alone', label: 'Solo Travel', icon: '🧍' },
        { id: 'friends', label: 'Friends', icon: '👥' },
        { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p>Loading options...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  {accommodation === option.id && <Check className="w-4 h-4 text-blue-600" />}
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
            {companionOptions.map(companion => (
              <div
                key={companion.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    companions.includes(companion.id)
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                      : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleCompanionToggle(companion.id)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{companion.icon}</span>
                  <span className="text-sm font-medium">{companion.label}</span>
                  {companions.includes(companion.id) && <Check className="w-4 h-4 text-blue-600" />}
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
          <Label className="block mb-3">Which amenities are important?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {amenityOptions.map(amenity => (
              <div
                key={amenity.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    amenities.includes(amenity.id)
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                      : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleAmenityToggle(amenity.id)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-sm font-medium">{amenity.label}</span>
                  {amenities.includes(amenity.id) && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
