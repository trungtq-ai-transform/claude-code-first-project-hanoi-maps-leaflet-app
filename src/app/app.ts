import { Component } from '@angular/core';
import { MapPage } from './features/map/map-page/map-page';

@Component({
  imports: [MapPage],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
