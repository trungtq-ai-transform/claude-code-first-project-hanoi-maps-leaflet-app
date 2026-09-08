import { Service, computed, inject, signal } from '@angular/core';
import { Landmark, LandmarkCategory } from '../models/landmark.model';
import { MapLayerType } from '../models/map-layer.model';
import { LandmarkData } from './landmark-data';

@Service()
export class MapState {
  private readonly landmarkData = inject(LandmarkData);

  readonly landmarks = computed<Landmark[]>(() => this.landmarkData.landmarks() ?? []);
  readonly isLoading = this.landmarkData.isLoading;

  readonly searchQuery = signal('');
  readonly activeCategories = signal<Set<LandmarkCategory>>(new Set());
  readonly selectedLandmarkId = signal<string | null>(null);
  readonly activeLayer = signal<MapLayerType>('street');
  readonly trafficVisible = signal(false);
  readonly sidebarOpen = signal(false);

  readonly filteredLandmarks = computed<Landmark[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const categories = this.activeCategories();
    return this.landmarks().filter((landmark) => {
      const matchesCategory = categories.size === 0 || categories.has(landmark.category);
      const matchesQuery = query === '' || landmark.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  readonly selectedLandmark = computed<Landmark | null>(
    () => this.landmarks().find((landmark) => landmark.id === this.selectedLandmarkId()) ?? null,
  );

  toggleCategory(category: LandmarkCategory): void {
    const next = new Set(this.activeCategories());
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    this.activeCategories.set(next);
  }

  clearCategories(): void {
    this.activeCategories.set(new Set());
  }

  selectLandmark(id: string): void {
    this.selectedLandmarkId.set(id);
  }

  setLayer(layer: MapLayerType): void {
    this.activeLayer.set(layer);
  }

  toggleTraffic(): void {
    this.trafficVisible.update((visible) => !visible);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
