import { Component, computed, input, output } from '@angular/core';
import { CATEGORY_OPTIONS, Landmark } from '../../../../core/models/landmark.model';

@Component({
  imports: [],
  selector: 'app-landmark-list-item',
  styleUrl: './landmark-list-item.css',
  templateUrl: './landmark-list-item.html',
})
export class LandmarkListItem {
  readonly landmark = input.required<Landmark>();
  readonly selected = input(false);
  readonly select = output<string>();

  protected readonly icon = computed(
    () => CATEGORY_OPTIONS.find((option) => option.value === this.landmark().category)?.icon ?? '📍',
  );
}
