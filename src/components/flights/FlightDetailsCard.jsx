import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const FlightDetailsCard = ({ flight, destinationDate, onEditFlight }) => {
  const formatTime = (timeString) => {
    // Handle various time formats
    if (!timeString) return '';
    
    // If it's already in a readable format like "14:30", return as is
    if (/^\d{1,2}:\d{2}(:\d{2})?( (AM|PM))?$/.test(timeString)) {
      return timeString;
    }
    
    // Otherwise try to parse and format
    try {
      const date = new Date(timeString);
      return format(date, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border-blue-200">
      <div className="bg-blue-500 h-1.5"></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Plane className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">
                {flight.airline}
              </h3>
              <div className="text-sm text-gray-500">
                {flight.flight_number}
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEditFlight}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            Edit
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center">
            <div className="text-lg font-semibold">
              {formatTime(flight.departure_time)}
            </div>
            <div className="text-sm font-medium">{flight.origin}</div>
          </div>
          
          <div className="flex-1 px-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-center relative">
              <div className="w-full h-px bg-gray-300"></div>
              <div className="absolute w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="absolute right-0 w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Direct flight</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-lg font-semibold">
              {formatTime(flight.arrival_time)}
            </div>
            <div className="text-sm font-medium">{flight.destination}</div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span>
            {destinationDate ? format(new Date(destinationDate), 'EEE, MMM d, yyyy') : 'Departure date'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightDetailsCard;