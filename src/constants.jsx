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
        return `[out:json];(node[amenity=${this.key}](${bbox});way[amenity=${this.key}](${bbox}););out body ${this.limit};`
    }
}

export const POIS = [
    ['Cinema', 'cinema', 100], ['Embassy', 'embassy', 100], ['Hospital', 'hospital', 100], ['University', 'university', 100],
    ['Post Office', 'post_office', 100], ['Hotel', 'hotel', 100], ['Hostel', 'hostel', 100], ['Cafe', 'cafe', 100],
    ['Restaurant', 'restaurant', 100], ['Museum', 'museum', 100], ['Zoo', 'zoo', 100], ['Theme Park', 'theme_park', 100] 

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
export const SUPPORTED_GEO_FILES = ['geojson', 'kml', 'shp', 'dbf', 'prj', 'cpg']