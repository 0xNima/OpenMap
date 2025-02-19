import { MapContainer, Marker, Popup, TileLayer, Tooltip, FeatureGroup } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { Sidebar } from './Sidebar'
import { IconButton } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { CoffeIcon, ParkIcon, RestaurantIcon } from '../assets';
import { icon } from 'leaflet'
import { ToastContainer } from 'react-toastify';
import { EditControl } from "react-leaflet-draw"
import * as L from "leaflet";


export default function(props) {
    const position = [48, 14]
    const [drawerState, setDrawer] = useState(false);
    const [layers, setLayers] = useState([
        {
            name: 'Precipitation',
            url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=d78cfd510447b3735d32c4965ee35c9b',
            active: true,
        },
        {
            name: 'Clouds',
            url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=d78cfd510447b3735d32c4965ee35c9b',
            active: true,
        },
        {
            name: 'Temprature',
            url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=d78cfd510447b3735d32c4965ee35c9b',
            active: true,
        },
        {
            name: 'Wind Speed',
            url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=d78cfd510447b3735d32c4965ee35c9b',
            active: true,
        },
        {
            name: 'See Level Pressure',
            url: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=d78cfd510447b3735d32c4965ee35c9b',
            active: false,
        }
    ]);
    const [poisData, setPoisData] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [features, setFeatures] = useState([]);

    return (
        <>
            <MapContainer center={position} zoom={5} scrollWheelZoom={true} doubleClickZoom={false} className='h-screen'>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                {layers.map((item, i) => (0 && item.active) ? <TileLayer url={item.url} key={i}/> : null)}
                
                {markers.map((item, i) => (
                    <Marker position={item.position} key={i}>
                        {item.name ? <Tooltip permanent={true}> {item.name} </Tooltip> : null}
                    </Marker>
                ))}

                {poisData.map(poi => (
                    <Marker 
                        key={poi.id}
                        position={[poi.lat, poi.lon]}
                        // icon={ICON_MAP[poi.tags.amenity ?? poi.tags.leisure ?? "default"]}
                        >
                        <Popup>
                            <b>{poi.tags.name || "Unnamed POI"}</b>
                            <br />
                            Type: {poi.tags.amenity || poi.tags.leisure}
                        </Popup>
                    </Marker>
                ))}

                <div className='leaflet-top leaflet-right'>
                    <Sidebar
                        isOpen={drawerState}
                        onClose={() => setDrawer(false)}
                        layers={layers}
                        layersToggle={setLayers}
                        markers={markers}
                        markerHandler={setMarkers}
                        setPoisData={setPoisData}
                        features={features}
                        featureHandler={setFeatures}
                    />
                </div>

                <FeatureGroup>
                    <EditControl
                        position="topleft"
                        onCreated={(e) => {
                            const { layer } = e;
                            const newFeature = {
                                id: layer._leaflet_id,
                                type: layer instanceof L.Marker ? "Point" : 
                                layer instanceof L.Polygon ? "Polygon" : 
                                layer instanceof L.Circle ? "Circle" :
                                layer instanceof L.Rectangle ? "Rectangle":
                                layer instanceof L.CircleMarker ? "CircleMarker":
                                "Line",
                                coordinates: layer instanceof L.Marker
                                    ? [layer.getLatLng().lat, layer.getLatLng().lng]
                                    : (layer instanceof L.Circle || layer instanceof L.CircleMarker) ? 
                                    [layer.getLatLng().lat, layer.getLatLng().lng, layer.getRadius()] : 
                                    layer.getLatLngs(),
                                center: layer.getCenter()
                            };
                            setFeatures([...features, newFeature]);
                        }}
                        draw={{
                            rectangle: { showArea: false },
                        }}
                        onDeleted={(e) => {
                            const newFeatures = features.filter(i => !(i.id in (e.layers._layers ?? {})));
                            setFeatures(newFeatures);
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
            <div className='leaflet-top leaflet-right'>
                <IconButton variant="text" size="lg" onClick={() => setDrawer(!drawerState)} className="leaflet-bar leaflet-control bg-white hover:bg-white">
                    {drawerState ? (
                    <XMarkIcon className="h-8 w-8 stroke-2" />
                    ) : (
                    <Bars3Icon className="h-8 w-8 stroke-2" />
                    )}
                </IconButton>
            </div>
            <ToastContainer />
        </>
    )
}