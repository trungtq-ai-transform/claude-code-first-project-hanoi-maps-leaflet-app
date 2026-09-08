import { Component, inject } from '@angular/core';
import { MapState } from '../../../core/services/map-state';
import { CategoryFilter } from './category-filter/category-filter';
import { LandmarkList } from './landmark-list/landmark-list';
import { SearchBar } from './search-bar/search-bar';

@Component({
  imports: [SearchBar, CategoryFilter, LandmarkList],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly mapState = inject(MapState);
}
