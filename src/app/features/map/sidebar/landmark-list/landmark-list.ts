import { Component, inject } from '@angular/core';
import { MapState } from '../../../../core/services/map-state';
import { LandmarkListItem } from '../landmark-list-item/landmark-list-item';

@Component({
  imports: [LandmarkListItem],
  selector: 'app-landmark-list',
  styleUrl: './landmark-list.css',
  templateUrl: './landmark-list.html',
})
export class LandmarkList {
  protected readonly mapState = inject(MapState);

  onSelect(id: string): void {
    this.mapState.selectLandmark(id);
  }
}
