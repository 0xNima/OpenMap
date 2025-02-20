import { CafeIcon, CinemaIcon, DefaultIcon, EmbassyIcon, HospitalIcon, HostelIcon, HotelIcon, MuseumIcon, ParkIcon, PostOfficeIcon, RestaurantIcon, ThemeParkIcon, UniversityIcon, ZooIcon } from './assets';
import { icon } from 'leaflet'

class POI {
    constructor(name, key, limit) {
        this.name = name;
        this.key = key;
        this.limit = limit;
        this.controller = null;
        this.active = false;
    }
    makeQuery (bbox) {
        return `[out:json][timeout:60];(node[amenity=${this.key}](${bbox});way[amenity=${this.key}](${bbox}););out body ${this.limit};`
    }
}

export const POIS = [
    ['Cinema', 'cinema', 50], ['Embassy', 'embassy', 50], ['Hospital', 'hospital', 50], ['University', 'university', 50],
    ['Post Office', 'post_office', 50], ['Hotel', 'hotel', 50], ['Hostel', 'hostel', 50], ['Cafe', 'cafe', 50],
    ['Restaurant', 'restaurant', 50], ['Museum', 'museum', 50], ['Zoo', 'zoo', 50], ['Theme Park', 'theme_park', 50] 

].map(i => new POI(...i));


export const ICON_MAP = {
    default: icon({ iconUrl: DefaultIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]}),
    restaurant: icon({ iconUrl: RestaurantIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]}),
    cafe: icon({ iconUrl: CafeIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    park: icon({ iconUrl: ParkIcon , iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    cinema: icon({ iconUrl: CinemaIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    embassy: icon({ iconUrl: EmbassyIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    hospital: icon({ iconUrl: HospitalIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    university: icon({ iconUrl: UniversityIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    post_office: icon({ iconUrl: PostOfficeIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    hotel: icon({ iconUrl: HotelIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    hostel: icon({ iconUrl: HostelIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    museum: icon({ iconUrl: MuseumIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    zoo: icon({ iconUrl: ZooIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    theme_prak: icon({ iconUrl: ThemeParkIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
};

export const FLAY_ZOOM = 8;
export const POI_MIN_REQUIRED_ZOOM = 8;
export const INIT_ZOOM = 5;
export const INIT_LOCATION = [48, 14]; 
export const SUPPORTED_GEO_FILES = ['geojson', 'kml']