import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents, FeatureGroup } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { Sidebar } from './Sidebar'
import { IconButton } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'
import { CoffeIcon, ParkIcon, RestaurantIcon } from '../assets';
import { icon } from 'leaflet'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { EditControl } from "react-leaflet-draw"
import * as L from "leaflet";

const POI_MIN_REQUIRED_ZOOM = 8;
const ICON_MAP = {
    restaurant: icon({ iconUrl: RestaurantIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]}),
    cafe: icon({ iconUrl: CoffeIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    park: icon({ iconUrl: ParkIcon , iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
};


function PoinOfIntrest(props) {
    const mapEvent = useMapEvents("moveend", () => fetchPOIs(map, props.setPoisData));
    const map = useMap();
    const controller = useRef(null);
    const toastId = useRef(null);

    useEffect(() => {
        const active = props.tags?.filter(i => i.active);
        if (!active?.length) return

        const bounds = map.getBounds();

        if (map.getZoom() < POI_MIN_REQUIRED_ZOOM) {
            map.flyTo(bounds.getCenter(), POI_MIN_REQUIRED_ZOOM);
        }

        fetchPOIs(bounds);
    }, [mapEvent, props.tags]);

    const fetchPOIs = async (bounds) => {
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        const q = props.tags.filter(i => i.active).map(i => `node[${i.query}](${bbox});`);

        if (!q.length) return
        
        let merged = '';

        for (const rule of q) {
            merged += `${rule}\n`
        }
        
        const query = `
            [out:json];
            (
              ${merged}
            );
            out body 20;`;
        
        try {
            if (controller.current) {
                controller.current.abort("Thre is a processing request");
                if (toastId.current) {
                    toast.dismiss(toastId.current);
                    toastId.current = null;
                }
            }
            controller.current = new AbortController();

            toastId.current = toast('Processing your request.\r\nThis may take a while.', {
                position: "bottom-right",
                autoClose: 180000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });

            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: `data=${encodeURIComponent(query)}`,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                signal: controller.current.signal
            });
            const data = await response.json();

            toast.dismiss(toastId.current);
            toast.success('POIs are ready!', {position: 'bottom-right'});
               
            props.setPoisData(data.elements || []);
        } catch (error) {
            if (error !== "Thre is a processing request") toast.dismiss(toastId.current);
            console.error("Error fetching POIs:", error);
        }
    };

    return null;
}

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
    const [pois, setPois] = useState([
        {
            name: 'Restaurant',
            active: false,
            query: '"amenity"="restaurant"',
        },
        {
            name: 'Cafe',
            active: false,
            query: '"amenity"="cafe"',
        },
        {
            name: 'Park',
            active: false,
            query: '"leisure"="park"',
        },
    ]);
    const [poisData, setPoisData] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [features, setFeatures] = useState([]);

    return (
        <>
            <MapContainer center={position} zoom={5} scrollWheelZoom={true} doubleClickZoom={false} className='h-screen'>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <PoinOfIntrest tags={pois} setPoisData={setPoisData}/>

                {layers.map((item, i) => (0 && item.active) ? <TileLayer url={item.url} key={i}/> : null)}
                
                {markers.map((item, i) => (
                    <Marker position={item.position} key={i}>
                        {item.name ? <Tooltip permanent={true}> {item.name} </Tooltip> : null}
                    </Marker>
                ))}

                {poisData.map(poi => (
                    <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={ICON_MAP[poi.tags.amenity ?? poi.tags.leisure ?? "default"]}>
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
                        pois={pois}
                        poisToggle={setPois}
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