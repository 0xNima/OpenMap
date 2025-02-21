# OpenMap

[**OpenMap**](https://0xnima.github.io/OpenMap/) is an interactive web mapping application powered by [Leaflet](https://leafletjs.com/). It enables users to view and interact with geospatial data seamlessly.

## Features
- **Geocoding Search**: Find locations on Earth by name and address
- **Open Weather Data**: Including **precipitation, temperature, clouds, etc.**
- **Sample Data**: The project includes sample data that users can activate to instantly see layers on the map. Click on the **information icon** at the top right of the page to open the sample layers' box
- **Supports Multiple Geospatial Data Formats**: Including **Shapefile**, **GeoJSON**, **KML**, and **GeoTIFF**
- **Interactive Map Interface**: Draw various geometries on the map, Pan, and zoom across various regions effortlessly.
- **Customizable Map Layers**: Integrate different tile layers to suit your mapping needs.

You can access full control of layers by clicking the **Hamburger icon** at the top right of the page to open the sidebar.

## Notice

OpenMap has some limitations:

1. **Point of Interest Data**: We use the Overpass Turbo API, which depends on the user's current bounding box. If the bounding box is too large, fetching data may take a long time. To get results quickly, keep your bounding box limited.

2. **Shapefile Uploads**: Currently, OpenMap only supports shapefiles with the **WGS84 Geographic Coordinate System (GCS)**.

This project is licensed under the MIT License. See the `LICENSE` file for more details.
