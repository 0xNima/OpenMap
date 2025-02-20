import React, { useCallback } from "react";
import {
  ArrowUpOnSquareIcon
} from "@heroicons/react/24/outline";
import { useMap } from "react-leaflet";
import { Bounce, toast } from "react-toastify";
import { useDropzone } from 'react-dropzone'
import { INIT_LOCATION, INIT_ZOOM, SUPPORTED_GEO_FILES } from "../constants";
import toGeoJSON from "@mapbox/togeojson";
import * as turf from "@turf/turf";
import shp from 'shpjs';
import parse_georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";


export default function(props) {
    const map = useMap();

    const onDrop = useCallback((acceptedFiles) => {
      acceptedFiles.filter(file => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!SUPPORTED_GEO_FILES.includes(ext)) {
            toast.warn(<div className="text-sm">Invalid file format: .{ext}<br/>Accepted files: {SUPPORTED_GEO_FILES.join(', ')}</div>, {
                position: "bottom-right", autoClose: 5000, theme: "light", transition: Bounce,
            });
            return false
        }
        Object.defineProperty(file, '__ext', { value: ext, writable: false});
        return true;
      }).forEach(async (file) => {
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = async () => {
            if (SUPPORTED_GEO_FILES.includes(file.__ext)) {
                if (['tif', 'geotif', 'tiff', 'geotiff'].includes(file.__ext)) {
                  const georaster = await parse_georaster(reader.result);
                  if (georaster) {
                    const layer = new GeoRasterLayer({
                      georaster: georaster,
                      opacity: 0.7,
                      resolution: 255
                    });
                    props.rasterHandler({name: file.name, layer, id: Date.now()});
                    props.rasterLayerGroup.current.addLayer(layer);
                    map.flyToBounds(layer.getBounds());
                  }
                  return
                }

                let geoData;
                let centerPoint;
                let bounds;

                if (file.__ext == 'geojson') {
                  const decoder = new TextDecoder("utf-8");
                  geoData = JSON.parse(decoder.decode(reader.result));
                  centerPoint = turf.center(geoData)?.geometry.coordinates?.reverse();
                } else if (file.__ext == 'kml') {
                  const parser = new DOMParser();
                  const decoder = new TextDecoder("utf-8");
                  const jsonText = decoder.decode(reader.result);
                  const kml = parser.parseFromString(jsonText, "text/xml");
                  geoData = toGeoJSON.kml(kml);
                  centerPoint = turf.center(geoData)?.geometry.coordinates?.reverse();
                } else { // 'shp', 'dbf', 'prj', 'cpg'
                  geoData = await shp({shp: reader.result});
                  const bbox = turf.bbox(geoData);
                  bounds = [bbox.slice(0, 2).reverse(), bbox.slice(2, 4).reverse()];
                }

                if (centerPoint) {
                  map.flyTo(centerPoint, INIT_ZOOM)
                } else if (bounds) {
                  map.flyToBounds(bounds, {maxZoom: INIT_ZOOM, duration: 5});
                }

                props.geoDataHandler({id: Date.now(), data: geoData, filename: file.name, center: centerPoint, bounds})
            } else {
                toast.warn(`Failed to load the file ${file.name}`, {
                    position: "bottom-right", autoClose: 5000, theme: "light", transition: Bounce,
                });
            }
        }
        reader.readAsArrayBuffer(file)
      })
      
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})
  
    return (
      <div {...getRootProps()} className={`${props.className ?? ""}`}>
        <input {...getInputProps()} />
        <span>Drop your Geo Files here</span>
        <ArrowUpOnSquareIcon className="h-10 w-10"/>
      </div>
    )
}