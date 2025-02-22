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
  ListItemSuffix,
} from "@material-tailwind/react";
import {
  PaintBrushIcon,
  Square3Stack3DIcon,
  GlobeEuropeAfricaIcon,
  FolderPlusIcon,
  EyeSlashIcon,
  EyeIcon
} from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useMap } from "react-leaflet";
import { Bounce, toast } from "react-toastify";
import { FLAY_ZOOM, INIT_LOCATION, INIT_ZOOM, POI_MIN_REQUIRED_ZOOM, POI_NOTIFICATION_DELAY, POIS, 
  COLLAPSED, LAYERS_SUB_MENU, POIS_SUB_MENU, DRAWING_SUB_MENU, GEODATA_SUB_MENU, RASTER_SUB_MENU } from "../constants";
import GeoCoder from "./GeoCoder";
import DragAndDrop from "./DragAndDrop";
import TrashIcon from "./TrashIcon";




export function Sidebar(props) {
  const [open, setOpen] = useState(props.deafultOpenTab ?? COLLAPSED);
  const [canShowAlert, setCanShowAlert] = useState(true);
  const map = useMap();
  const toastId = useRef(null);
  const [pendingReqs, setPendingReqs] = useState(0);
  const [wl, setWL] = useState(false);
  const [pl, setPL] = useState(false);
  const [dl, setDL] = useState(false);
  const [gl, setGL] = useState(false);
  const [rl, setRL] = useState(false);

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

  useEffect(() => {
    props.wl?.current.getLayers().forEach(l => wl ? map.removeLayer(l) : map.addLayer(l));
  }, [wl])

  useEffect(() => {
    props.pl?.current.getLayers().forEach(l => pl ? map.removeLayer(l) : map.addLayer(l));
  }, [pl])

  useEffect(() => {
    props.dl?.current.getLayers().forEach(l => dl ? map.removeLayer(l) : map.addLayer(l));
  }, [dl])

  useEffect(() => {
    props.gl?.current.getLayers().forEach(l => gl ? map.removeLayer(l) : map.addLayer(l));
  }, [gl])

  useEffect(() => {
    props.rl?.current.getLayers().forEach(l => rl ? map.removeLayer(l) : map.addLayer(l));
  }, [rl])

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

  const possiblyAlert = () => {
    if (map.getZoom() < POI_MIN_REQUIRED_ZOOM && (open !== POIS_SUB_MENU) && canShowAlert) {
      props.setShowAlert(true);
      setCanShowAlert(false);                 
      setTimeout(() => {
        setCanShowAlert(true);
      }, POI_NOTIFICATION_DELAY);
    }
  }

  return (
      <Drawer
        open={props.isOpen}
        onClose={props.onClose}
        className="overflow-y-scroll no-scrollbar"
        onMouseEnter={(e) => {
          if (typeof map.scrollWheelZoom.disable == 'function') map.scrollWheelZoom.disable();
        }}
        onMouseLeave={(e) => {
            if (typeof map.scrollWheelZoom.enable == 'function') map.scrollWheelZoom.enable();
        }}  
      >
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
            {/* Weather Layers */}
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
                  <ListItemSuffix>
                    {
                        wl ? 
                        <EyeSlashIcon className="h-4 w-4" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setWL(false);
                        }}/> : 
                        <EyeIcon className="h-4 w-4" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setWL(true);
                        }}/>
                    }
                  </ListItemSuffix>
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
                                    <Typography color="blue-gray" className="text-sm font-medium">{item.name}</Typography>
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
                  onClick={() => {
                    possiblyAlert();
                    handleOpen(POIS_SUB_MENU);
                  }}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix><GlobeEuropeAfricaIcon className="h-5 w-5" /></ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">POIs</Typography>
                  <ListItemSuffix>
                    {
                        pl ? 
                        <EyeSlashIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setPL(false);
                        }}/> : 
                        <EyeIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setPL(true);
                        }}/>
                    }
                  </ListItemSuffix>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <Card className="shadow-none max-h-[200px] overflow-y-scroll thin-scrollbar border-gray-400 rounded-b-xs">
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
                                        <Typography color="blue-gray" className="text-sm font-medium">{item.name}</Typography>
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
                    {
                        dl ? 
                        <EyeSlashIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setDL(false);
                        }}/> : 
                        <EyeIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setDL(true);
                        }}/>
                    }
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List 
                    className="p-0 shadow-none max-h-[200px] overflow-y-scroll thin-scrollbar border-gray-400 rounded-b-xs"
                >
                  {
                    props?.features.map((item, i) => (
                        <ListItem key={i} className="pr-0 py-2 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyTo(item.center, FLAY_ZOOM);
                        }}>
                            <Typography color="blue-gray" className="text-sm font-normal truncate">{`${item.type} ${item.id}`}</Typography>
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
                    {
                        gl ? 
                        <EyeSlashIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setGL(false);
                        }}/> : 
                        <EyeIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setGL(true);
                        }}/>
                    }
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props?.geoData.map((item, i) => (
                        <ListItem key={i} className="pr-0 py-0 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (item.center) {
                              map.flyTo(item.center, INIT_ZOOM);
                            } else if (item.bounds) {
                              map.flyToBounds(item.bounds, INIT_ZOOM);
                            }
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

            {/* Uploaded Raster Files */}
            <Accordion
              open={open === RASTER_SUB_MENU}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === RASTER_SUB_MENU ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === RASTER_SUB_MENU}>
                <AccordionHeader
                  onClick={() => handleOpen(RASTER_SUB_MENU)}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix><FolderPlusIcon className="h-5 w-5" /></ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">Uploaded Rasters</Typography>
                    {
                        rl ? 
                        <EyeSlashIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRL(false);
                        }}/> : 
                        <EyeIcon className="h-4 w-4" onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRL(true);
                        }}/>
                    }
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {
                    props?.rasters.map((item, i) => (
                        <ListItem key={i} className="pr-0 py-0 hover:bg-gray-100 justify-between" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyToBounds(item?.layer?.getBounds());
                        }}>
                            <Typography color="blue-gray" className="mr-auto font-normal truncate">{item.name}</Typography>
                            <ListItemPrefix className="m-0">
                                <IconButton variant="text" color="blue-gray">
                                    <TrashIcon onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('Are you sure to remove the file?')) {
                                            props.rasterDeleted(item.id);
                                            if (item.layer) props.rl.current.removeLayer(item.layer);
                                            map.flyTo(INIT_LOCATION, INIT_ZOOM);
                                            handleOpen(RASTER_SUB_MENU);
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
                rasterHandler={props.setRaster}
                rasterLayerGroup={props.rl}
            />
          </List>
        </Card>
      </Drawer>
  );
}