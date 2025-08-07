import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Loader2, Search, Check, Plane } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// AviationStack API key
const AVIATION_STACK_API_KEY = '214590cc66acef49ce488cafacebb39a';

const FlightDetailsDialog = ({ open, onOpenChange, destination, startDate, onFlightSelected }) => {
  const [status, setStatus] = useState('manual-entry'); // 'searching', 'results', 'manual-entry'
  const [flightCode, setFlightCode] = useState('');
  const [flightDetails, setFlightDetails] = useState(null);
  const [error, setError] = useState(null);

  const searchFlightByCode = async code => {
    setStatus('searching');
    setError(null);

    try {
      if (!code.match(/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/i)) {
        setError('Please enter a valid flight code (e.g. BA123)');
        return;
      }

      const url = `https://api.aviationstack.com/v1/flights?access_key=${AVIATION_STACK_API_KEY}&flight_iata=${code}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data?.data?.[0]) {
        setError('Could not find flight details. Please check the flight code and try again.');
        return;
      }

      const flight = data.data[0];
      const departureTime = new Date(flight.departure.scheduled);
      const arrivalTime = new Date(flight.arrival.scheduled);
      const durationMs = arrivalTime.getTime() - departureTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      setFlightDetails({
        flight_number: `${flight.airline.iata}${flight.flight.number}`,
        airline: flight.airline.name || 'Unknown Airline',
        departure_time: format(departureTime, 'HH:mm'),
        arrival_time: format(arrivalTime, 'HH:mm'),
        origin: flight.departure.iata,
        destination: flight.arrival.iata,
        duration: `${hours}h ${minutes}m`,
      });

      setStatus('results');
    } catch (error) {
      console.error('Error fetching flight:', error);
      setError('Could not connect to flight service. Please try again.');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (flightCode.trim()) {
      searchFlightByCode(flightCode.trim());
    }
  };

  const handleSelectFlight = () => {
    if (flightDetails) {
      onFlightSelected(flightDetails);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {status === 'searching' ? 'Searching flight...' : 'Enter Flight Details'}
          </DialogTitle>
        </DialogHeader>

        {status === 'manual-entry' && (
          <div className="py-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter flight code (e.g. BA123)"
                    value={flightCode}
                    onChange={e => setFlightCode(e.target.value.toUpperCase())}
                    className="text-center text-lg"
                    autoFocus
                  />
                  {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Flight
                </Button>
              </div>
            </form>
          </div>
        )}

        {status === 'searching' && (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-gray-500">Looking up flight details...</p>
          </div>
        )}

        {status === 'results' && flightDetails && (
          <div className="py-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">{flightDetails.airline}</h3>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  {flightDetails.flight_number}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold">{flightDetails.departure_time}</p>
                  <p className="text-sm text-gray-500">{flightDetails.origin}</p>
                </div>

                <div className="flex-1 mx-4 relative">
                  <div className="border-t border-gray-300"></div>
                  <Plane
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary rotate-90"
                    size={16}
                  />
                  <p className="text-xs text-gray-500 text-center mt-4">{flightDetails.duration}</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold">{flightDetails.arrival_time}</p>
                  <p className="text-sm text-gray-500">{flightDetails.destination}</p>
                </div>
              </div>

              <Button
                onClick={handleSelectFlight}
                className="w-full mt-6"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm Flight Details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FlightDetailsDialog;
