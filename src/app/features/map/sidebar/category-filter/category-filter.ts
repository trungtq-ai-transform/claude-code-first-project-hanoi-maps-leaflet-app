import { Component, inject } from '@angular/core';
import { CATEGORY_OPTIONS, LandmarkCategory } from '../../../../core/models/landmark.model';
import { MapState } from '../../../../core/services/map-state';

@Component({
  imports: [],
  selector: 'app-category-filter',
  styleUrl: './category-filter.css',
  templateUrl: './category-filter.html',
})
export class CategoryFilter {
  protected readonly mapState = inject(MapState);
  protected readonly categories = CATEGORY_OPTIONS;

  toggle(category: LandmarkCategory): void {
    this.mapState.toggleCategory(category);
  }

  isActive(category: LandmarkCategory): boolean {
    return this.mapState.activeCategories().has(category);
  }
}
