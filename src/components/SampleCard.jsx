import React, { useEffect, useState } from "react";
import {
  Drawer,
  Typography,
  Checkbox,
  ListItemPrefix,
  ListItem,
  List,
} from "@material-tailwind/react";
import { useMap } from "react-leaflet";
import { Spinner } from "@material-tailwind/react";

export function SampleCard(props) {
    const map = useMap();
    const [spinner, setSpinner] = useState(false);
    
    useEffect(() => {
        (props.gj1bbox ?? props.gj2bbox ?? props.gj3bbox ?? 
            props.sh1bbox ?? props.sh2bbox ?? props.sh3bbox ?? 
            props.r1bbox ?? props.k1bbox) ? (spinner ? setSpinner(false) : null) : setSpinner(true);
    }, [
        props.gj1bbox, props.gj2bbox, props.gj3bbox,
        props.sh1bbox, props.sh2bbox, props.sh3bbox,
        props.r1bbox, props.k1bbox
    ]);

    function render(handler, bbox, name) {
        const disable = !Boolean(bbox);

        return <ListItem className="px-0 py-2">
            <label
                htmlFor={`sample-vertical-list-${name}`}
                className={`flex w-full cursor-pointer items-center px-3 py-2 pl-0 ${disable && 'cursor-progress text-gray-500'}`}
            >
                <ListItemPrefix className="mr-3">
                    <Checkbox
                        disabled={disable}
                        id={`sample-vertical-list-${name}`}
                        ripple={false}
                        className="hover:before:opacity-0"
                        containerProps={{
                            className: "p-0",
                        }}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            handler(checked);
                            if (checked && bbox) map.fitBounds(bbox);
                        }}/>
                </ListItemPrefix>
                <Typography color="blue-gray" className="text-sm font-medium">{name}</Typography>
            </label>
        </ListItem>
    }

    return (
        <React.Fragment>
            <Drawer 
                open={props.isOpen} onClose={props.onClose}
                className="overflow-y-scroll thin-scrollbar p-4 !h-[50vh] top-[126px] right-[10px] rounded-sm"
                placement="right"
                onMouseEnter={(e) => {
                    if (typeof map.scrollWheelZoom.disable == 'function') map.scrollWheelZoom.disable();
                }}
                onMouseLeave={(e) => {
                    if (typeof map.scrollWheelZoom.enable == 'function') map.scrollWheelZoom.enable();
                }}
                onTouchStart={() => typeof map.dragging.disable == 'function' && map.dragging.disable()}
                onTouchEnd={() => typeof map.dragging.enable == 'function' && map.dragging.enable()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <Typography variant="h5" color="blue-gray">
                        Sample Layers
                    </Typography>
                </div>
                {
                    spinner ? <Spinner className="absolute m-auto top-0 bottom-0 right-0 left-0" />
                    : <List className='p-0'>
                        {render(props.gj1Handler, props.gj1bbox, 'Europe Geojson')}
                        {render(props.sh3Handler, props.sh3bbox, 'Germany Boundry Shapefile')}
                        {render(props.r1Handler, props.r1bbox, 'Lisbon Elevation Geotif')}
                        {render(props.gj2Handler, props.gj2bbox, 'Ontarion Geojson')}
                        {render(props.k1Handler, props.k1bbox, 'Denmark Boundry KML')}
                        {render(props.sh1Handler, props.sh1bbox, 'Crime Shapefile')}
                        {render(props.gj3Handler, props.gj3bbox, 'Quebec Geojson')}
                        {render(props.sh2Handler, props.sh2bbox, 'South Africa Boundry Shapefile')}
                    </List>
                }
            </Drawer>
        </React.Fragment>
    );
}