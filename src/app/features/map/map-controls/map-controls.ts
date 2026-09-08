import { Component, inject } from '@angular/core';
import { LeafletMap } from '../../../core/services/leaflet-map';
import { MapState } from '../../../core/services/map-state';

@Component({
  imports: [],
  selector: 'app-map-controls',
  styleUrl: './map-controls.css',
  templateUrl: './map-controls.html',
})
export class MapControls {
  protected readonly mapState = inject(MapState);
  private readonly leafletMap = inject(LeafletMap);

  setLayer(layer: 'street' | 'satellite'): void {
    this.mapState.setLayer(layer);
  }

  toggleTraffic(): void {
    this.mapState.toggleTraffic();
  }

  recenter(): void {
    this.leafletMap.recenter();
  }
}
