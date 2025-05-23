// components/ui/MapView.js
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; 
import LoadingSpinner from './LoadingSpinner';

if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
}


function RecenterAutomatically({ mapCenter, mapZoom, markers, userLocated }) {
    const map = useMap();
    const hasCenteredOnMarkers = useRef(false); 

    useEffect(() => {
        if (markers && markers.length > 0 && !hasCenteredOnMarkers.current) {
            const validMarkers = markers.filter(m => m.position && m.position[0] !== undefined && m.position[1] !== undefined);
            if (validMarkers.length > 0) {
                const bounds = L.latLngBounds(validMarkers.map(m => m.position));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
                    hasCenteredOnMarkers.current = true; 
                } else if (validMarkers.length === 1) {
                     map.setView(validMarkers[0].position, mapZoom || 10);
                     hasCenteredOnMarkers.current = true;
                }
            }
        } else if (userLocated && mapCenter && !hasCenteredOnMarkers.current) { 
            map.setView(mapCenter, mapZoom || 10);
        }
    }, [mapCenter, mapZoom, markers, map, userLocated]); 
    
    useEffect(() => {
        hasCenteredOnMarkers.current = false;
    }, [markers]);

    return null;
}


export default function MapView({ contacts, initialCenter }) {
  const [markers, setMarkers] = useState([]);
  const [isLoadingGeocodes, setIsLoadingGeocodes] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [currentMapCenter, setCurrentMapCenter] = useState(initialCenter || [39.8283, -98.5795]); 
  const [currentMapZoom, setCurrentMapZoom] = useState(initialCenter ? 10 : 4); 
  const [userLocated, setUserLocated] = useState(!!initialCenter); 

  useEffect(() => {
    if(initialCenter) {
        setCurrentMapCenter(initialCenter);
        setCurrentMapZoom(10); 
        setUserLocated(true);
    }
  }, [initialCenter]);


  useEffect(() => {
    const geocodeContacts = async () => {
      if (!contacts || contacts.length === 0) {
        setMarkers([]);
        setIsLoadingGeocodes(false); 
        return;
      }

      setIsLoadingGeocodes(true);
      setMapError(null);
      
      const newMarkersPromises = contacts.map(async (contact) => {
        let position;
        let addressString = '';

        if (contact.coordinates && typeof contact.coordinates.lat === 'number' && typeof contact.coordinates.lng === 'number') {
          position = [contact.coordinates.lat, contact.coordinates.lng];
        } else {
          if (contact.address) {
            addressString = contact.address;
          } else if (contact.city && contact.state) {
            addressString = `${contact.city}, ${contact.state}`;
          }
          
          if (addressString) {
            try {
              const response = await fetch(`/api/geocode?address=${encodeURIComponent(addressString)}`);
              const data = await response.json();
              if (response.ok && typeof data.lat === 'number' && typeof data.lng === 'number') {
                position = [data.lat, data.lng];
              } else {
                console.warn(`Geocoding failed for ${addressString}: ${data.message || 'Unknown error'}`);
              }
            } catch (error) {
              console.error(`Error geocoding ${addressString}:`, error);
            }
          }
        }

        if (position) {
          return {
            position,
            popupContent: `
              <div style="font-family: sans-serif; font-size: 14px;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">
                  ${contact.first_name || ''} ${contact.last_name || ''}
                </h3>
                <p style="margin: 0 0 3px 0; color: #555;">${contact.title || ''}</p>
                <p style="margin: 0 0 3px 0; color: #555;">${contact.organization_name || ''}</p>
                <p style="margin: 0; color: #777;">${addressString || (contact.city && contact.state ? `${contact.city}, ${contact.state}` : 'Location not fully specified')}</p>
                ${contact.email ? `<a href="mailto:${contact.email}" style="color: #007bff; text-decoration: none;">${contact.email}</a>` : ''}
              </div>
            `,
          };
        }
        return null; 
      });

      try {
        const resolvedMarkers = (await Promise.all(newMarkersPromises)).filter(marker => marker !== null);
        setMarkers(resolvedMarkers);
      } catch (error) {
        console.error("Error resolving geocoding promises:", error);
        setMapError("An error occurred while preparing map markers.");
      } finally {
        setIsLoadingGeocodes(false);
      }
    };

    geocodeContacts();
  }, [contacts]);


  if (isLoadingGeocodes && markers.length === 0 && contacts && contacts.length > 0) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /> <p className="ml-2">Geocoding locations...</p></div>;
  }

  return (
    <>
      {mapError && <p className="text-center text-sm text-red-500 p-2 bg-red-50 rounded-md">{mapError}</p>}
      <MapContainer 
        key={JSON.stringify(currentMapCenter)} 
        center={currentMapCenter} 
        zoom={currentMapZoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
        />
        {markers.map((marker, idx) => (
          marker.position && marker.position[0] !== undefined && marker.position[1] !== undefined ? (
            <Marker key={idx} position={marker.position}>
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: marker.popupContent }} />
              </Popup>
            </Marker>
          ) : null
        ))}
        <RecenterAutomatically mapCenter={currentMapCenter} mapZoom={currentMapZoom} markers={markers} userLocated={userLocated} />
      </MapContainer>
    </>
  );
}
