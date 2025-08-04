'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary, MapMouseEvent } from '@vis.gl/react-google-maps';

// --- INTERFACES ---

interface Place {
    placePrediction: {
        text: { text: string };
        place: string;
    };
}

interface PlaceDetails {
    displayName: { text: string };
    location: {
        latitude: number;
        longitude: number;
    };
}

interface PlaceAutocompleteProps {
    onPlaceSelect: (place: { name: string; lat: number; lng: number }) => void;
}

interface MapComponentProps {
    mode: 'pin' | 'polygon';
    onPinChange: (position: { lat: number; lng: number }) => void;
    onPolygonChange: (path: Array<{ lat: number; lng: number }>) => void;
    initialPosition: { lat: number; lng: number };
    drawnPath: Array<{ lat: number; lng: number }>;
    fillColor: string;
}

interface MapLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: {
        type: 'pin' | 'polygon';
        name: string;
        details: string;
        center: { lat: number; lng: number };
        path?: Array<{ lat: number; lng: number }>;
        fillColor?: string;
        strokeColor?: string;
    }) => void;
}

// --- CHILD COMPONENTS ---

function PlaceAutocomplete({ onPlaceSelect }: PlaceAutocompleteProps) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<Place[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const fetchSuggestions = useCallback(async (text: string) => {
        if (!text) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
                },
                body: JSON.stringify({ input: text }),
            });
            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSuggestions(input);
        }, 300);
        return () => clearTimeout(handler);
    }, [input, fetchSuggestions]);

    const handleSelect = async (place: Place) => {
        setInput(place.placePrediction.text.text);
        setSuggestions([]);
        try {
            const response = await fetch(`https://places.googleapis.com/v1/${place.placePrediction.place}?fields=location,displayName`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': process.env.NEXT_PUBLIC_Maps_API_KEY || '',
                },
            });
            const placeDetails: PlaceDetails = await response.json();
            if (placeDetails.location) {
                onPlaceSelect({
                    name: placeDetails.displayName.text,
                    lat: placeDetails.location.latitude,
                    lng: placeDetails.location.longitude,
                });
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    };

    return (
        <div className="relative w-full">
            <input
                value={input}
                onChange={handleInputChange}
                placeholder="Search to position map"
                className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            {suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                        >
                            {suggestion.placePrediction.text.text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function MapComponent({ mode, onPinChange, onPolygonChange, initialPosition, drawnPath, fillColor }: MapComponentProps) {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(mode === 'pin' ? initialPosition : null);
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            polygonOptions: {
                fillOpacity: 0.3,
                strokeWeight: 2,
                editable: true,
                draggable: true,
            },
        });
        setDrawingManager(manager);

        manager.addListener('polygoncomplete', (polygon: google.maps.Polygon) => {
            const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
            onPolygonChange(path);
            polygon.setMap(null);
            manager.setDrawingMode(null);
        });

        return () => {
            if (manager) {
                google.maps.event.clearInstanceListeners(manager);
                manager.setMap(null);
            }
        };
    }, [map, drawing, onPolygonChange]);

    useEffect(() => {
        if (map && drawingManager) {
            if (mode === 'polygon') {
                drawingManager.setMap(map);
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
                setMarkerPos(null);
            } else {
                drawingManager.setDrawingMode(null);
                drawingManager.setMap(null);
                setMarkerPos(initialPosition);
            }
        }
    }, [mode, map, drawingManager, initialPosition]);

    useEffect(() => {
        if (polygonRef.current) {
            polygonRef.current.setMap(null);
        }
        if (map && mode === 'polygon' && drawnPath.length > 0) {
            polygonRef.current = new google.maps.Polygon({
                paths: drawnPath,
                fillColor: fillColor,
                fillOpacity: 0.3,
                strokeColor: fillColor,
                strokeWeight: 2,
            });
            polygonRef.current.setMap(map);
        }
    }, [map, mode, drawnPath, fillColor]);

    useEffect(() => {
        if (map && initialPosition) {
            map.panTo(initialPosition);
        }
    }, [initialPosition, map]);

    const handleMapClick = (event: MapMouseEvent) => {
        if (mode === 'pin' && event.detail.latLng) {
            const lat = event.detail.latLng.lat;
            const lng = event.detail.latLng.lng;
            const newPos = { lat, lng };
            setMarkerPos(newPos);
            onPinChange(newPos);
        }
    };

    return (
        <Map
            defaultCenter={initialPosition}
            defaultZoom={16}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            onClick={handleMapClick}
            className="h-64 w-full rounded-md md:h-80" // Responsive height
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
        >
            {mode === 'pin' && markerPos && <AdvancedMarker position={markerPos} />}
        </Map>
    );
}


// --- MAIN EXPORTED COMPONENT (Fixed for responsiveness) ---

export default function MapLocationModal({ isOpen, onClose, onSave }: MapLocationModalProps) {
    const [mode, setMode] = useState<'pin' | 'polygon'>('pin');
    const [pinCenter, setPinCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [polygonPath, setPolygonPath] = useState<Array<{ lat: number; lng: number }>>([]);
    const [locationName, setLocationName] = useState('');
    const [locationDetails, setLocationDetails] = useState('');
    const [fillColor, setFillColor] = useState('#FF0000');
    const [mapCenter, setMapCenter] = useState({ lat: 12.8231, lng: 80.0444 });

    if (!isOpen) return null;

    const handleSave = () => {
        if (mode === 'pin' && pinCenter) {
            onSave({
                type: 'pin',
                name: locationName,
                details: locationDetails,
                center: pinCenter,
            });
        } else if (mode === 'polygon' && polygonPath.length > 2) {
            const bounds = new google.maps.LatLngBounds();
            polygonPath.forEach(p => bounds.extend(new google.maps.LatLng(p.lat, p.lng)));
            const center = bounds.getCenter();

            onSave({
                type: 'polygon',
                name: locationName,
                details: locationDetails,
                center: { lat: center.lat(), lng: center.lng() },
                path: polygonPath,
                fillColor: fillColor,
                strokeColor: fillColor,
            });
        }
        onClose();
    };

    return (
        // Backdrop with padding
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            {/* Modal Panel: Use flex-col and control height */}
            <div className="flex h-full w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900 sm:max-h-[95vh]">

                {/* Header */}
                <div className="border-b border-gray-200 p-6 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Add a Location</h3>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                        {/* Left Column: Inputs */}
                        <div className="space-y-4 md:col-span-1">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Mode</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <button
                                        onClick={() => setMode('pin')}
                                        className={`w-full px-4 py-2 text-sm rounded-l-md ${mode === 'pin' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                    >
                                        Pin
                                    </button>
                                    <button
                                        onClick={() => setMode('polygon')}
                                        className={`w-full px-4 py-2 text-sm rounded-r-md ${mode === 'polygon' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                    >
                                        Area
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="locationName" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Location Name</label>
                                <input
                                    type="text"
                                    id="locationName"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    placeholder="e.g., Main Stage"
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="locationDetails" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Info Box Details</label>
                                <textarea
                                    id="locationDetails"
                                    value={locationDetails}
                                    onChange={(e) => setLocationDetails(e.target.value)}
                                    rows={3}
                                    placeholder="Details to show in pop-up..."
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                />
                            </div>
                            {mode === 'polygon' && (
                                <div>
                                    <label htmlFor="fillColor" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Area Color</label>
                                    <input
                                        type="color"
                                        id="fillColor"
                                        value={fillColor}
                                        onChange={(e) => setFillColor(e.target.value)}
                                        className="mt-1 h-10 w-full cursor-pointer rounded-md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Column: Map */}
                        <div className="md:col-span-2">
                            <APIProvider apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY || ''}>
                                <PlaceAutocomplete onPlaceSelect={(place) => setMapCenter(place)} />
                                <div className="mt-2">
                                    <MapComponent
                                        mode={mode}
                                        onPinChange={setPinCenter}
                                        onPolygonChange={setPolygonPath}
                                        initialPosition={mapCenter}
                                        drawnPath={polygonPath}
                                        fillColor={fillColor}
                                    />
                                </div>
                            </APIProvider>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 p-6 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Save Location
                    </button>
                </div>
            </div>
        </div>
    );
}