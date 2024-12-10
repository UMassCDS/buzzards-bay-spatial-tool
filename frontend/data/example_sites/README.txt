These are example site files for use with the COMBB project Spatial Interview Tool (Question 2 in proposal).

sites.csv  The sites table from the COMBB data archive on one drive. Downloaded 2024-11-08.
sites.json  JSON file created from sites.csv with some columns dropped and two random variables ("ran1", "ran2") added.  
sites.geojson  Same data as sites.json but as a GeoJSON file.  This is an extension of JSON used for vector GIS data, but the
  file is more complex than sites.json.

Retained columns in json files:
  site: The site code used by the COMBB project
  latitude, longitude:  Latitude and longitude in WGS84 coordinates (EPSG:4326)
  description:  Site description
  tide_station:  NOAA tide station that best represents tide height at the station
  ran1:  Random uniform variable ranging from 0 to 1
  ran2: Random normally distributed variable mean =50, sd = 4

Ethan 
2024-11-08
