import React from "react";
import {
  Drawer,
  Typography,
  Checkbox,
  ListItemPrefix,
  ListItem,
  List,
} from "@material-tailwind/react";
import { useMap } from "react-leaflet";
import { map } from "leaflet";
import { INIT_ZOOM } from "../constants";


export function SampleCard(props) {
    const map = useMap();

    function render(handler, bbox, name) {
        return <ListItem className="px-0 py-2">
            <label
                htmlFor={`sample-vertical-list-${name}`}
                className="flex w-full cursor-pointer items-center px-3 py-2 pl-0"
            >
                <ListItemPrefix className="mr-3">
                    <Checkbox
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
            <Drawer open={props.isOpen} onClose={props.onClose} className="p-4 !h-[50vh] top-[126px] right-[10px] rounded-sm" placement="right">
                <div className="mb-6 flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    Sample Layers
                </Typography>
                </div>
                <List className='p-0'>
                    {render(props.gj1Handler, props.gj1bbox, 'Europe Geojson')}
                    {render(props.gj2Handler, props.gj2bbox, 'Ontarion Geojson')}
                    {render(props.gj3Handler, props.gj3bbox, 'Quebec Geojson')}
                    {render(props.sh1Handler, props.sh1bbox, 'Property Shapefile')}
                    {render(props.r1Handler, props.r1bbox, 'Lisbon Elevation Geotif')}
                </List>
            </Drawer>
        </React.Fragment>
    );
}