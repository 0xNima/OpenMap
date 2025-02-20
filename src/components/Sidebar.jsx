import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Drawer,
  Card,
  Checkbox,
  IconButton,
} from "@material-tailwind/react";
import {
  PaintBrushIcon,
  Square3Stack3DIcon,
  GlobeEuropeAfricaIcon,
  FolderPlusIcon
} from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useMap } from "react-leaflet";
import { Bounce, toast } from "react-toastify";
import { FLAY_ZOOM, INIT_LOCATION, INIT_ZOOM, POIS } from "../constants";
import GeoCoder from "./GeoCoder";
import DragAndDrop from "./DragAndDrop";
import TrashIcon from "./TrashIcon";


const COLLAPSED = 0
const LAYERS_SUB_MENU = 1
const MARKERS_SUB_MENU = 2
const POIS_SUB_MENU = 3
const DRAWING_SUB_MENU = 4
const GEODATA_SUB_MENU = 5


export function Sidebar(props) {
  const [open, setOpen] = useState(0);
  const map = useMap();
  const toastId = useRef(null);
  const [pendingReqs, setPendingReqs] = useState(0);

  useEffect(() => {
    if (pendingReqs) {
        if (toastId.current) {
            toast.update(toastId.current, {render: <div className="text-sm">Processing You Request...<br/>Pending requests: {pendingReqs}</div>, autoClose: 60008 * pendingReqs})
        } else {
            toastId.current = toast.info(<div className="text-sm">Processing You Request...<br/>Pending requests: {pendingReqs}</div>, {
                position: "bottom-right",
                autoClose: 60000 * pendingReqs,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    } else {
        toast.dismiss(toastId.current);
        toastId.current = null;
    }
  }, [pendingReqs]);

  const handleOpen = (value) => {
    setOpen(open === value ? COLLAPSED : value);
  };

  const fetchPOIs = async (tag) => {
    const bounds = map.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    setPendingReqs(prev => prev + 1);

    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: `data=${encodeURIComponent(tag.makeQuery(bbox))}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            signal: tag.controller.signal
        });
        const data = await response.json();
        toast.success(<div className="text-sm">{tag.name} POIs are ready!</div>, {position: 'bottom-right'});
        props.setPoisData(data.elements?.filter(i => (typeof i.lat === 'number') && (typeof i.lon === 'number')) || []);
        } catch (error) {
            if (!error.startsWith?.call(error, 'Abort Fetching')) toast.error(<div className="text-sm">Failedto fetch {tag.name} POIs</div>, {position: 'bottom-right'});
            console.error("Error fetching POIs:", error);
        } finally {
            setPendingReqs(prev => Math.max(prev - 1, 0));
        }
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
            <GeoCoder open={props.isOpen}/>
          </div>

          <List>
            {/* Layers */}
            <Accordion
              open={open === LAYERS_SUB_MENU}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === LAYERS_SUB_MENU ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === LAYERS_SUB_MENU}>
                <AccordionHeader
                  onClick={() => handleOpen(LAYERS_SUB_MENU)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix><Square3Stack3DIcon className="h-5 w-5" /></ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">Weather Layers</Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <Card className="shadow-none">
                    <List className="p-0">
                        {props.layers?.map((item, i) => {
                            return <ListItem className="p-0" key={i}>
                                <label
                                    htmlFor={`vertical-list-react-${i}`}
                                    className="flex w-full cursor-pointer items-center px-3 py-2"
                                >
                                    <ListItemPrefix className="mr-3">
                                        <Checkbox
                                            id={`vertical-list-react-${i}`}
                                            ripple={false}
                                            className="hover:before:opacity-0"
                                            containerProps={{
                                                className: "p-0",
                                            }}
                                            defaultChecked={item.active}
                                            onChange={e => {
                                                item.active = e.target.checked;
                                                props.layersToggle([...props.layers]);
                                            }}/>
                                    </ListItemPrefix>
                                    <Typography color="blue-gray" className="font-medium">{item.name}</Typography>
                                </label>
                            </ListItem>
                            })
                        }
                    </List>
                </Card>
              </AccordionBody>
            </Accordion>
            
            {/* POIs */}
            <Accordion
              open={open === POIS_SUB_MENU}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === POIS_SUB_MENU ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === POIS_SUB_MENU}>
                <AccordionHeader
                  onClick={() => handleOpen(POIS_SUB_MENU)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix><GlobeEuropeAfricaIcon className="h-5 w-5" /></ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">POIs</Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <Card className="shadow-none max-h-[200px] overflow-y-scroll thin-scrollbar border-b-1 border-gray-400 rounded-b-xs"
                    onMouseEnter={(e) => {
                        if (typeof map.scrollWheelZoom.disable == 'function') map.scrollWheelZoom.disable();
                    }}
                    onMouseLeave={(e) => {
                        if (typeof map.scrollWheelZoom.enable == 'function') map.scrollWheelZoom.enable();
                    }}
                    >
                    <List className="p-0">
                        {POIS.map((item, i) => {
                            return <ListItem className="p-0" key={i}>
                                <label
                                    htmlFor={`vertical-list-react-${i}`}
                                    className="flex w-full cursor-pointer items-center px-3 py-2"
                                >
                                    <ListItemPrefix className="mr-3">
                                        <Checkbox
                                            id={`vertical-list-react-${i}`}
                                            ripple={false}
                                            className="hover:before:opacity-0"
                                            containerProps={{
                                                className: "p-0",
                                            }}
                                            defaultChecked={item.active}
                                            onChange={e => {
                                                item.active = e.target.checked;
                                                if (item.controller) item.controller.abort(`Abort Fetching ${item.name}`);
                                                if (e.target.checked) {
                                                    item.controller = new AbortController();
                                                    fetchPOIs(item);
                                                } else {
                                                    item.controller = null;
                                                }
                                            }}/>
                                    </ListItemPrefix>
                                    <Typography color="blue-gray" className="font-medium">{item.name}</Typography>
                                </label>
                            </ListItem>
                            })
                        }
                    </List>
                </Card>
              </AccordionBody>
            </Accordion>

            {/* Drawings */}
            <Accordion
              open={open === DRAWING_SUB_MENU}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === DRAWING_SUB_MENU ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === DRAWING_SUB_MENU}>
                <AccordionHeader
                  onClick={() => handleOpen(DRAWING_SUB_MENU)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix><PaintBrushIcon className="h-5 w-5" /></ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">Drawings</Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props?.features.map((item, i) => (
                        <ListItem key={i} className="pr-0 py-0 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyTo(item.center, FLAY_ZOOM);
                        }}>
                            <Typography color="blue-gray" className="font-medium truncate">{`${item.type} ${item.id}`}</Typography>
                        </ListItem>
                    ))
                  }
                </List>
              </AccordionBody>
            </Accordion>

            {/* Uploaded Geo Files */}
            <Accordion
              open={open === GEODATA_SUB_MENU}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === GEODATA_SUB_MENU ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === GEODATA_SUB_MENU}>
                <AccordionHeader
                  onClick={() => handleOpen(GEODATA_SUB_MENU)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix><FolderPlusIcon className="h-5 w-5" /></ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">Uploaded Geo Files</Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props?.geoData.map((item, i) => (
                        <ListItem key={i} className="pr-0 py-0 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyTo(item.center, INIT_ZOOM);
                        }}>
                            <Typography color="blue-gray" className="mr-auto font-normal truncate">{item.filename}</Typography>
                            <ListItemPrefix className="m-0">
                                <IconButton variant="text" color="blue-gray">
                                    <TrashIcon onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('Are you sure to remove the file?')) {
                                            props.geoDataDeleted(item.id);
                                            map.flyTo(INIT_LOCATION, INIT_ZOOM);
                                            handleOpen(GEODATA_SUB_MENU);
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

            <hr className="my-2 border-blue-gray-50" />

            <DragAndDrop
                className="h-[200px] text-sm border-2 border-gray-400 border-dashed rounded-md flex flex-col items-center justify-center gap-3"
                geoDataHandler={props.geoDataHandler}
            />
          </List>
        </Card>
      </Drawer>
  );
}