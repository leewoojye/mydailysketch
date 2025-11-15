
import React, { useState, useEffect, useCallback } from 'react';
import { Place } from '../types';
import { getPlaceInfo } from '../services/geminiService';
import { X, Search } from './Icons';

interface LocationSearchModalProps {
  onClose: () => void;
  onSelectLocation: (place: Place) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ onClose, onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn('Could not get user location:', err.message);
      }
    );
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    try {
      const places = await getPlaceInfo(query, userLocation);
      setResults(places);
    } catch (err) {
      setError('Could not fetch locations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, userLocation]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-stone-700">Search for a Location</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800">
            <X size={24} />
          </button>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Central Park' or 'nearby cafes'"
            className="w-full p-3 pl-10 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
        <button
            onClick={handleSearch}
            disabled={isLoading || !query}
            className="w-full py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 disabled:bg-stone-300 transition-colors"
        >
            {isLoading ? 'Searching...' : 'Search'}
        </button>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <ul className="space-y-2">
            {results.map((place, index) => (
              <li
                key={index}
                onClick={() => onSelectLocation(place)}
                className="p-3 bg-stone-50 hover:bg-amber-100 rounded-lg cursor-pointer border border-stone-200"
              >
                <p className="font-semibold text-stone-800">{place.name}</p>
                <p className="text-sm text-stone-600">{place.address}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationSearchModal;
