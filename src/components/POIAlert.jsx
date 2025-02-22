import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { useMap } from "react-leaflet";
import { POI_MIN_REQUIRED_ZOOM } from "../constants";


function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}
 
export function POIAlert(props) {
    const map = useMap();
    return (
        <Dialog open={props.open} handler={props.handleOpen}>
            <DialogHeader className="gap-2">
                <Icon />
                <Typography variant="h5" color="blue-gray">Notice</Typography>
            </DialogHeader>
            <DialogBody divider className="grid place-items-center gap-4">
                <Typography className="font-normal">
                    We use <span className="font-medium">Overpass turbo API</span> to fetch Point Of Interests, its
                    performance depends on your current <span className="font-medium">Bounding Box</span>. 
                    Select <span className="font-medium">(Automatic) Zoom</span> to confine your bounding box.
                </Typography>
            </DialogBody>
            <DialogFooter className="space-x-2 py-2">
                <Button variant="text" color="blue-gray" onClick={() => {
                  props.handleOpen();
                  props?.onClose(false);
                }}>Dismiss</Button>
                <Button variant="gradient" onClick={() => {
                    map.flyTo(map.getCenter(), POI_MIN_REQUIRED_ZOOM);
                    props.handleOpen();
                    props?.onClose(true);
                }}>Optimal Zoom</Button>
            </DialogFooter>
        </Dialog>
    );
}