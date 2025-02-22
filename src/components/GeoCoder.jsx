import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  Input,
  Card,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMap } from "react-leaflet";
import { FLAY_ZOOM } from "../constants";


export default function (props) {
    const map = useMap();
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    let tid;

    const handleSearch = (e) => {
        clearTimeout(tid);
        tid = setTimeout(async () => {
            setSearchTerm(e.target.value);
            if (e.target.value.length > 2) {
                const response = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + e.target.value);
                const data = await response.json();
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        }, 100)
    };

    const handleSelect = (place) => {
        const { lat, lon, display_name } = place;
        map.flyTo([parseFloat(lat), parseFloat(lon)], FLAY_ZOOM);
        setSearchTerm(display_name);
        setSuggestions([]);
    };

    useEffect(() => {
        if (!props.open) {
            setSearchTerm("");
            setSuggestions([]);
        }
    }, [props.open])

    return <>
        <Input
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            label="Search a Location or address"
            onChange={handleSearch}
        />
        {
            suggestions.length ?
            <Card
                className="fixed z-10000 max-h-[200px] max-w-[300px] truncate overflow-y-scroll thin-scrollbar-rounded"
                onMouseEnter={() => typeof map.scrollWheelZoom.disable == 'function' && map.scrollWheelZoom.disable()}
                onMouseLeave={() => typeof map.scrollWheelZoom.enable == 'function' && map.scrollWheelZoom.enable()}
            >
                <List>
                    {
                        suggestions.map((item, i) => {
                            return <ListItem
                                className="w-full truncate hover:bg-gray-100"
                                key={i}
                                onClick={() => {
                                    handleSelect(item);
                                }}
                                > {item.display_name} </ListItem>
                        })
                    }
                </List>
            </Card> : null
        }
    </>;
}