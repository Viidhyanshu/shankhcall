import * as L from 'leaflet';

declare module 'leaflet' {
  export function markerClusterGroup(options?: any): any;
  export function heatLayer(latlngs: any[], options?: any): any;
  
  export interface Map {
    markerClusterGroup: any;
    heatLayer: any;
  }
}
