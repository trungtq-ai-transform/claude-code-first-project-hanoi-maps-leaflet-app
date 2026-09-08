import { HttpClient } from '@angular/common/http';
import { Service, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Landmark } from '../models/landmark.model';

@Service()
export class LandmarkData {
  private readonly http = inject(HttpClient);

  private readonly landmarksResource = resource({
    loader: () => firstValueFrom(this.http.get<Landmark[]>('data/landmarks.json')),
  });

  readonly landmarks = this.landmarksResource.value;
  readonly isLoading = this.landmarksResource.isLoading;
}
