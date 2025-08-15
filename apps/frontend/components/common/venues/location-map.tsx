"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface LocationMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function LocationMap({ 
  initialLat, 
  initialLng, 
  onLocationSelect, 
  className = "" 
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
      initializeMap();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded && initialLat && initialLng) {
      setCurrentLocation({ lat: initialLat, lng: initialLng });
    }
  }, [isMapLoaded, initialLat, initialLng]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = currentLocation || { lat: 40.7128, lng: -74.0060 }; // Default to NYC

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 13,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setCurrentLocation({ lat, lng });
      onLocationSelect(lat, lng);
      
      if (markerRef.current) {
        markerRef.current.setPosition(event.latLng);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: event.latLng,
          map: map,
          draggable: true,
          title: 'Selected Location',
        });

        markerRef.current.addListener('dragend', (event: any) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          setCurrentLocation({ lat: newLat, lng: newLng });
          onLocationSelect(newLat, newLng);
        });
      }
    });

    if (currentLocation) {
      markerRef.current = new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        draggable: true,
        title: 'Selected Location',
      });

      markerRef.current.addListener('dragend', (event: any) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        setCurrentLocation({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng);
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCurrentLocation({ lat, lng });
          onLocationSelect(lat, lng);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(15);
            
            if (markerRef.current) {
              markerRef.current.setPosition({ lat, lng });
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: { lat, lng },
                map: mapInstanceRef.current,
                draggable: true,
                title: 'Current Location',
              });

              markerRef.current.addListener('dragend', (event: any) => {
                const newLat = event.latLng.lat();
                const newLng = event.latLng.lng();
                setCurrentLocation({ lat: newLat, lng: newLng });
                onLocationSelect(newLat, newLng);
              });
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please select manually on the map.');
    }
  };

  if (!isMapLoaded) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Venue Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Use Current Location
          </Button>
        </div>
        
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300"
        />
        
        {currentLocation && (
          <div className="text-sm text-gray-600">
            <p><strong>Selected Location:</strong></p>
            <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
            <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Click on the map to change location or drag the marker to adjust
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

