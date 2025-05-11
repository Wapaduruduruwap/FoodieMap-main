import { YandexMapComponent } from '../yandex-map/yandex-map.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [YandexMapComponent],  // ← Важно!
  templateUrl: './home.component.html',
})
export class HomeComponent {}