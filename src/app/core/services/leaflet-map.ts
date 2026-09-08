import { Service } from '@angular/core';
import * as L from 'leaflet';
import { CATEGORY_OPTIONS, Landmark } from '../models/landmark.model';
import { DEFAULT_ZOOM, HANOI_CENTER, MapLayerType } from '../models/map-layer.model';

const CATEGORY_ICON_LOOKUP = new Map(CATEGORY_OPTIONS.map((option) => [option.value, option.icon]));

const CONGESTION_COLOR: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

@Service()
export class LeafletMap {
  private map: L.Map | null = null;
  private readonly markerLayer = L.layerGroup();
  private readonly markersById = new Map<string, L.Marker>();
  private streetLayer!: L.TileLayer;
  private satelliteLayer!: L.TileLayer;
  private trafficLayer: L.GeoJSON | null = null;
  private onMarkerSelect: ((id: string) => void) | null = null;

  initMap(container: HTMLElement): void {
    if (this.map) {
      return;
    }

    this.map = L.map(container, {
      center: HANOI_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    this.satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      },
    );

    this.streetLayer.addTo(this.map);
    this.markerLayer.addTo(this.map);
  }

  destroy(): void {
    this.map?.remove();
    this.map = null;
    this.markersById.clear();
    this.trafficLayer = null;
  }

  onSelect(callback: (id: string) => void): void {
    this.onMarkerSelect = callback;
  }

  renderMarkers(landmarks: Landmark[]): void {
    this.markerLayer.clearLayers();
    this.markersById.clear();

    for (const landmark of landmarks) {
      const icon = L.divIcon({
        className: 'landmark-marker',
        html: `<div class="landmark-marker__pin">${CATEGORY_ICON_LOOKUP.get(landmark.category) ?? '📍'}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 32],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([landmark.lat, landmark.lng], { icon }).bindPopup(
        this.buildPopupHtml(landmark),
        { maxWidth: 280 },
      );

      marker.on('click', () => this.onMarkerSelect?.(landmark.id));
      marker.addTo(this.markerLayer);
      this.markersById.set(landmark.id, marker);
    }
  }

  flyTo(landmark: Landmark, zoom = 17): void {
    if (!this.map) {
      return;
    }
    this.map.flyTo([landmark.lat, landmark.lng], zoom, { duration: 0.8 });
    this.markersById.get(landmark.id)?.openPopup();
  }

  recenter(): void {
    this.map?.flyTo(HANOI_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }

  setLayer(type: MapLayerType): void {
    if (!this.map) {
      return;
    }
    if (type === 'satellite') {
      this.map.removeLayer(this.streetLayer);
      this.satelliteLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.satelliteLayer);
      this.streetLayer.addTo(this.map);
    }
  }

  async setTrafficVisible(visible: boolean): Promise<void> {
    if (!this.map) {
      return;
    }

    if (!visible) {
      if (this.trafficLayer) {
        this.map.removeLayer(this.trafficLayer);
      }
      return;
    }

    if (!this.trafficLayer) {
      const response = await fetch('geo/traffic-mock.geojson');
      const data = await response.json();
      this.trafficLayer = L.geoJSON(data, {
        style: (feature) => ({
          color: CONGESTION_COLOR[(feature?.properties?.['congestion'] as string) ?? 'low'],
          weight: 5,
          opacity: 0.75,
        }),
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.['name'];
          if (name) {
            layer.bindTooltip(name, { sticky: true });
          }
        },
      });
    }

    this.trafficLayer.addTo(this.map);
  }

  private buildPopupHtml(landmark: Landmark): string {
    const icon = CATEGORY_ICON_LOOKUP.get(landmark.category) ?? '📍';
    const image = landmark.imageUrl
      ? `<img src="${landmark.imageUrl}" alt="${landmark.name}" class="landmark-popup__image" />`
      : '';
    return `
      <div class="landmark-popup">
        ${image}
        <div class="landmark-popup__category">${icon} ${landmark.address}</div>
        <div class="landmark-popup__title">${landmark.name}</div>
        <div class="landmark-popup__description">${landmark.description}</div>
      </div>
    `;
  }
}
