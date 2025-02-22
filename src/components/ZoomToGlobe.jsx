import { useEffect } from "react";
import { useMap } from "react-leaflet"
import { INIT_LOCATION, INIT_ZOOM } from "../constants";

export default function(props) {
    const map = useMap();

    useEffect(() => {
        map.setView(INIT_LOCATION, INIT_ZOOM, {animate: true});
    }, [props.zoom]);

    return null
}