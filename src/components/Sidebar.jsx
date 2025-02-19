import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Input,
  Drawer,
  Card,
  Checkbox,
  IconButton,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/solid";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMap } from "react-leaflet";


const FLAY_ZOOM = 5;

function GeoCoder(props) {
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
        }, 500)
    };

    const handleSelect = (place) => {
        const { lat, lon, display_name } = place;
        map.flyTo([parseFloat(lat), parseFloat(lon)], FLAY_ZOOM);

        const markers = props?.markers ?? [];
        markers.push({
            position: [parseFloat(lat), parseFloat(lon)],
            name: place.display_name,
            id: Date.now()
        });

        props?.markerHandler([...markers]);

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
                className="absolute z-10000 w-full max-h-[200px] overflow-y-scroll thin-scrollbar"
                onMouseEnter={() => map.scrollWheelZoom = false}
                onMouseLeave={() => map.scrollWheelZoom = true}
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


function TrashIcon(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        onClick={props?.onClick}
      >
        <path
          fillRule="evenodd"
          d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
          clipRule="evenodd"
        />
      </svg>
    );
}


export function Sidebar(props) {
  const [open, setOpen] = React.useState(0);
  const map = useMap();

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };
 
  return (
      <Drawer open={props.isOpen} onClose={props.onClose}>
        <Card
          color="transparent"
          shadow={false}
          className="h-[calc(100vh-2rem)] w-full p-4"
        >
          <div className="flex items-center gap-4 p-4">
            <Typography variant="h5" color="blue-gray">
              Control
            </Typography>
          </div>
          
          <div className="p-2">
            <GeoCoder open={props.isOpen} markers={props.markers} markerHandler={props.markerHandler}/>
          </div>

          <List>
            <Accordion
              open={open === 1}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === 1 ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === 1}>
                <AccordionHeader
                  onClick={() => handleOpen(1)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix>
                    <Square3Stack3DIcon className="h-5 w-5" />
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    Layers
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props.layers?.map((item, i) => {
                        return <ListItem key={i}>
                            <Checkbox label={item.name} defaultChecked={item.active} onChange={e => {
                                item.active = e.target.checked;
                                props.layersToggle([...props.layers]);
                            }}/>
                        </ListItem>
                    })
                  }
                </List>
              </AccordionBody>
            </Accordion>
            
            <Accordion
              open={open === 2}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === 2 ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === 2}>
                <AccordionHeader
                  onClick={() => handleOpen(2)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix>
                    <ShoppingBagIcon className="h-5 w-5" />
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    Markers
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props?.markers.map((item, i) => (
                        <ListItem key={i} className="pr-0 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyTo(item.position, FLAY_ZOOM);
                        }}>
                            <div className="truncate">{item.name}</div>
                            <ListItemPrefix className="m-0">
                                <IconButton variant="text" color="blue-gray">
                                    <TrashIcon onClick={() => {
                                        if (confirm('Are you sure to remove the market?')) {
                                            const markers = props.markers.filter(i => i.id !== item.id);
                                            props.markerHandler(markers);
                                            handleOpen(2);
                                        }
                                    }}/>
                                </IconButton>
                            </ListItemPrefix>
                        </ListItem>
                    ))
                  }
                </List>
              </AccordionBody>
            </Accordion>
            
            <Accordion
              open={open === 3}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === 3 ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === 3}>
                <AccordionHeader
                  onClick={() => handleOpen(3)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix>
                    <Square3Stack3DIcon className="h-5 w-5" />
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    POIs
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props.pois?.map((item, i) => {
                        return <ListItem key={i}>
                            <Checkbox color={item.color} label={item.name} defaultChecked={item.active} onChange={e => {
                                item.active = e.target.checked;
                                props.poisToggle([...props.pois]);
                            }}/>
                        </ListItem>
                    })
                  }
                </List>
              </AccordionBody>
            </Accordion>

            <Accordion
              open={open === 4}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === 4 ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === 4}>
                <AccordionHeader
                  onClick={() => handleOpen(4)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix>
                    <ShoppingBagIcon className="h-5 w-5" />
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    Drawings
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props?.features.map((item, i) => (
                        <ListItem key={i} className="pr-0 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyTo(item.center, FLAY_ZOOM);
                        }}>
                            <div className="truncate">{`${item.type} ${item.id}`}</div>
                        </ListItem>
                    ))
                  }
                </List>
              </AccordionBody>
            </Accordion>

            <hr className="my-2 border-blue-gray-50" />
            
            <ListItem>
              <ListItemPrefix>
                <UserCircleIcon className="h-5 w-5" />
              </ListItemPrefix>
              Upload File
            </ListItem>
          </List>
        </Card>
      </Drawer>
  );
}