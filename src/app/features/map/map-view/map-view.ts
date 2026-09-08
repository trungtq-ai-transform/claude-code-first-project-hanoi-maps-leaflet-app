import { Component, ElementRef, afterNextRender, effect, inject, viewChild } from '@angular/core';
import { LeafletMap } from '../../../core/services/leaflet-map';
import { MapState } from '../../../core/services/map-state';

@Component({
  imports: [],
  selector: 'app-map-view',
  styleUrl: './map-view.css',
  templateUrl: './map-view.html',
})
export class MapView {
  private readonly leafletMap = inject(LeafletMap);
  private readonly mapState = inject(MapState);
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  constructor() {
    afterNextRender(() => {
      this.leafletMap.initMap(this.mapContainer().nativeElement);
      this.leafletMap.onSelect((id) => this.mapState.selectLandmark(id));
      this.leafletMap.renderMarkers(this.mapState.filteredLandmarks());
      this.leafletMap.setLayer(this.mapState.activeLayer());
      void this.leafletMap.setTrafficVisible(this.mapState.trafficVisible());
    });

    effect(() => this.leafletMap.renderMarkers(this.mapState.filteredLandmarks()));
    effect(() => this.leafletMap.setLayer(this.mapState.activeLayer()));
    effect(() => void this.leafletMap.setTrafficVisible(this.mapState.trafficVisible()));
    effect(() => {
      const landmark = this.mapState.selectedLandmark();
      if (landmark) {
        this.leafletMap.flyTo(landmark);
      }
    });
  }
}
