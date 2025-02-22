import { MapContainer, Marker, Popup, TileLayer, Tooltip, FeatureGroup, GeoJSON, LayerGroup } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { Sidebar } from './Sidebar'
import { IconButton } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { InformationCircleIcon as OInformationCircleIcon } from '@heroicons/react/24/outline'

import { useEffect, useRef, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { EditControl } from "react-leaflet-draw"
import * as L from "leaflet";
import { ICON_MAP, INIT_LOCATION, INIT_ZOOM } from '../constants'
import { POIAlert } from './POIAlert'
import { SampleCard } from './SampleCard'
import shp from 'shpjs';
import parse_georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import toGeoJSON from "@mapbox/togeojson";


export default function() {
    const position = INIT_LOCATION;
    const [drawerState, setDrawer] = useState(false);
    const [showSampleCard, setShowSampleCard] = useState(false);
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
            active: false,
        },
        {
            name: 'Wind Speed',
            url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=d78cfd510447b3735d32c4965ee35c9b',
            active: false,
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
    
    const [gj1, setGJ1] = useState();
    const [showGJ1, setShowGJ1] = useState(false);

    const [gj2, setGJ2] = useState();
    const [showGJ2, setShowGJ2] = useState(false);

    const [gj3, setGJ3] = useState();
    const [showGJ3, setShowGJ3] = useState(false);

    const [sh1, setSH1] = useState();
    const [showSH1, setShowSH1] = useState(false);

    const [sh2, setSH2] = useState();
    const [showSH2, setShowSH2] = useState(false);

    const [sh3, setSH3] = useState();
    const [showSH3, setShowSH3] = useState(false);

    const [r1, setR1] = useState();
    const [showR1, setShowR1] = useState(false);

    const [k1, setK1] = useState();
    const [showK1, setShowK1] = useState(false);

    const weatherLayer = useRef(null);
    const poiLayer = useRef(null);
    const geodataLayer = useRef(null);
    const drawingLayer = useRef(null);
    const rasterLayer = useRef(null);
    const sampleLayer = useRef(null);

    function loadGeoJsons() {
        fetch('/OpenMap/samples/europe.geojson').then(res => res.json()).then(geodata => {
            const layer = L.geoJSON(geodata);
            setGJ1({data: layer, bbox: layer.getBounds()});
        });

        fetch('/OpenMap/samples/ontario.geojson').then(res => res.json()).then(geodata => {
            const layer = L.geoJSON(geodata);
            setGJ2({data: layer, bbox: layer.getBounds()});
        });

        fetch('/OpenMap/samples/quebec.geojson').then(res => res.json()).then(geodata => {
            const layer = L.geoJSON(geodata);
            setGJ3({data: layer, bbox: layer.getBounds()});
        });

        fetch('/OpenMap/samples/denmark.kml').then(res => res.arrayBuffer()).then(geodata => {
            const parser = new DOMParser();
            const decoder = new TextDecoder("utf-8");
            const jsonText = decoder.decode(geodata);
            const kml = parser.parseFromString(jsonText, "text/xml");
            const layer = L.geoJSON(toGeoJSON.kml(kml));
            setK1({data: layer, bbox: layer.getBounds()});
        });
    }

    function loadShapefiles() {
        fetch('/OpenMap/samples/Crime.shp').then(res => res.arrayBuffer()).then(buff => {
            shp({shp: buff}).then(geodata => {
                const layer = L.geoJSON(geodata);
                setSH1({data: layer, bbox: layer.getBounds()});
            })
        });

        fetch('/OpenMap/samples/south-africa.shp').then(res => res.arrayBuffer()).then(buff => {
            shp({shp: buff}).then(geodata => {
                const layer = L.geoJSON(geodata);
                setSH2({data: layer, bbox: layer.getBounds()});
            })
        });

        fetch('/OpenMap/samples/germany-boundry.shp').then(res => res.arrayBuffer()).then(buff => {
            shp({shp: buff}).then(geodata => {
                const layer = L.geoJSON(geodata);
                setSH3({data: layer, bbox: layer.getBounds()});
            })
        });
    }

    function loadRasters() {
        fetch('/OpenMap/samples/lisbon-elevation.tif').then(res => res.arrayBuffer()).then(buff => {
            parse_georaster(buff).then(georaster => {
                if (georaster) {
                    const layer = new GeoRasterLayer({
                      georaster,
                      opacity: 0.7,
                      resolution: 255
                    });
                    setR1({data: layer, bbox: layer.getBounds()});
                }
            })
        });
    }

    /** Load Samples */
    useEffect(() => {
        loadGeoJsons();
        loadShapefiles();
        loadRasters();
    }, [])

    useEffect(() => {
        if (gj1) showGJ1 ? sampleLayer.current.addLayer(gj1.data) : sampleLayer.current.removeLayer(gj1.data);
    }, [showGJ1])

    useEffect(() => {
        if (gj2) showGJ2 ? sampleLayer.current.addLayer(gj2.data) : sampleLayer.current.removeLayer(gj2.data);
    }, [showGJ2])

    useEffect(() => {
        if (gj3) showGJ3 ? sampleLayer.current.addLayer(gj3.data) : sampleLayer.current.removeLayer(gj3.data);
    }, [showGJ3])

    useEffect(() => {
        if (sh1) showSH1 ? sampleLayer.current.addLayer(sh1.data) : sampleLayer.current.removeLayer(sh1.data);
    }, [showSH1])

    useEffect(() => {
        if (sh2) showSH2 ? sampleLayer.current.addLayer(sh2.data) : sampleLayer.current.removeLayer(sh2.data);
    }, [showSH2])

    useEffect(() => {
        if (sh3) showSH3 ? sampleLayer.current.addLayer(sh3.data) : sampleLayer.current.removeLayer(sh3.data);
    }, [showSH3])

    useEffect(() => {
        if (r1) showR1 ? sampleLayer.current.addLayer(r1.data) : sampleLayer.current.removeLayer(r1.data);
    }, [showR1])

    useEffect(() => {
        if (k1) showK1 ? sampleLayer.current.addLayer(k1.data) : sampleLayer.current.removeLayer(k1.data);
    }, [showK1])

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

                <POIAlert open={showAlert} handleOpen={() => setShowAlert(!showAlert)} onClose={(confirmed) => {
                    setDrawer(true);
                }}/>
                
                <LayerGroup ref={sampleLayer}></LayerGroup>

                <div className="leaflet-top leaflet-right">
                    <SampleCard
                        isOpen={showSampleCard}
                        onClose={() => setShowSampleCard(false)}
                        gj1Handler={setShowGJ1}
                        gj1bbox={gj1?.bbox}
                        gj2Handler={setShowGJ2}
                        gj2bbox={gj2?.bbox}
                        gj3Handler={setShowGJ3}
                        gj3bbox={gj3?.bbox}
                        sh1Handler={setShowSH1}
                        sh1bbox={sh1?.bbox}
                        sh2Handler={setShowSH2}
                        sh2bbox={sh2?.bbox}
                        sh3Handler={setShowSH3}
                        sh3bbox={sh3?.bbox}
                        r1Handler={setShowR1}
                        r1bbox={r1?.bbox}
                        k1Handler={setShowK1}
                        k1bbox={k1?.bbox}/>
                </div>

            </MapContainer>
            <div className='leaflet-top leaflet-right'>
                <IconButton variant="text" size="lg" onClick={() => setDrawer(!drawerState)} className="leaflet-bar leaflet-control bg-white hover:bg-white">
                    {drawerState ? (
                    <XMarkIcon className="h-8 w-8 stroke-2" />
                    ) : (
                    <Bars3Icon className="h-8 w-8 stroke-2" />
                    )}
                </IconButton>
                <IconButton variant="text" size="lg" onClick={() => setShowSampleCard(!showSampleCard)} className="leaflet-bar leaflet-control bg-white hover:bg-white">
                    {showSampleCard ? (
                    <InformationCircleIcon className="h-8 w-8 stroke-2" />
                    ) : (
                    <OInformationCircleIcon className="h-8 w-8 stroke-2" />
                    )}
                </IconButton>
            </div>
            <ToastContainer newestOnTop={true}/>
        </>
    )
}