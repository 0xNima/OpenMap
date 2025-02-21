import { MapContainer, Marker, Popup, TileLayer, Tooltip, FeatureGroup, GeoJSON, LayerGroup } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { Sidebar } from './Sidebar'
import { IconButton } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { useRef, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { EditControl } from "react-leaflet-draw"
import * as L from "leaflet";
import { ICON_MAP, INIT_LOCATION, INIT_ZOOM } from '../constants'
import { POIAlert } from './POIAlert'

export default function() {
    const position = INIT_LOCATION;
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
    const [features, setFeatures] = useState([]);
    const [geoData, setGeoData] = useState([]);
    const [rasters, setRasters] = useState([]);
    const [showAlert, setShowAlert] = useState(false);

    const weatherLayer = useRef(null);
    const poiLayer = useRef(null);
    const geodataLayer = useRef(null);
    const drawingLayer = useRef(null);
    const rasterLayer = useRef(null);

    return (
        <>
            <MapContainer center={position} zoom={INIT_ZOOM} scrollWheelZoom={true} doubleClickZoom={false} className='h-screen'>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                <LayerGroup ref={weatherLayer}>
                    {layers.map((item, i) => item.active ? <TileLayer url={item.url} key={i}/> : null)}
                </LayerGroup>

                <LayerGroup ref={poiLayer}>
                    {poisData.map((poi, i) => (
                        <Marker  key={i} position={[poi.lat, poi.lon]} icon={ICON_MAP[poi.tags.amenity ?? poi.tags.leisure ?? "default"]}>
                            <Popup>
                                <b>{poi.tags.name || "Unnamed POI"}</b>
                                <br />
                                Type: {poi.tags.amenity || poi.tags.leisure}
                            </Popup>
                        </Marker>
                    ))}
                </LayerGroup>

                <LayerGroup ref={geodataLayer}>
                    {geoData.map((gdata, i) => (
                        <GeoJSON key={i} data={gdata.data}>
                            <Tooltip offset={[0, 20]} opacity={1}>
                                    {`File Name: ${gdata.filename}`}
                                    <br/>
                                    {
                                        gdata.data?.type ? `Feature Type: ${gdata.data?.type}` : null 
                                    }
                            </Tooltip>
                        </GeoJSON>
                    ))}
                </LayerGroup>
                
                <LayerGroup ref={drawingLayer}>
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
                                        layer instanceof L.CircleMarker ? "CircleMarker": "Line",
                                    coordinates: layer instanceof L.Marker
                                        ? [layer.getLatLng().lat, layer.getLatLng().lng]
                                        : (layer instanceof L.Circle || layer instanceof L.CircleMarker) ? 
                                        [layer.getLatLng().lat, layer.getLatLng().lng, layer.getRadius()] : 
                                        layer.getLatLngs(),
                                    center: (layer instanceof L.Marker || 
                                            layer instanceof L.Circle || 
                                            layer instanceof L.CircleMarker
                                        ) ? [layer.getLatLng().lat, layer.getLatLng().lng] :
                                        layer.getCenter?.call(layer)
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
                </LayerGroup>

                <LayerGroup ref={rasterLayer}></LayerGroup>
                        
                <div className='leaflet-top leaflet-right'>
                    <Sidebar
                        isOpen={drawerState}
                        onClose={() => setDrawer(false)}
                        layers={layers}
                        layersToggle={setLayers}
                        setPoisData={(data) => data?.length ? setPoisData((prev) => [...prev, ...data]) : null}
                        features={features}
                        featureHandler={setFeatures}
                        geoData={geoData}
                        geoDataHandler={(data) => setGeoData((prev) => [...prev, data])}
                        geoDataDeleted={(deletedId) => {
                            setGeoData(geoData.filter(i => i.id !== deletedId));
                        }}
                        rasters={rasters}
                        setRaster={(raster) => setRasters(prev => [...prev,raster])}
                        rasterDeleted={(deletedId) => {
                            setRasters(rasters.filter(i => i.id !== deletedId));
                        }}
                        wl={weatherLayer}
                        pl={poiLayer}
                        gl={geodataLayer}
                        dl={drawingLayer}
                        rl={rasterLayer}
                        setShowAlert={setShowAlert}
                    />
                </div>

                <POIAlert open={showAlert} handleOpen={() => setShowAlert(!showAlert)}/>
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
            <ToastContainer newestOnTop={true}/>
        </>
    )
}