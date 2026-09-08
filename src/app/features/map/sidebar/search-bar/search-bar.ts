import { Component, inject } from '@angular/core';
import { MapState } from '../../../../core/services/map-state';

@Component({
  imports: [],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  protected readonly mapState = inject(MapState);

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.mapState.searchQuery.set(value);
  }

  clear(): void {
    this.mapState.searchQuery.set('');
  }
}
