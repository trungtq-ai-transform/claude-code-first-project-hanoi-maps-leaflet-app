import { Component, inject } from '@angular/core';
import { MapState } from '../../../core/services/map-state';
import { MapControls } from '../map-controls/map-controls';
import { MapView } from '../map-view/map-view';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  imports: [Sidebar, MapView, MapControls],
  selector: 'app-map-page',
  styleUrl: './map-page.css',
  templateUrl: './map-page.html',
})
export class MapPage {
  protected readonly mapState = inject(MapState);
}
