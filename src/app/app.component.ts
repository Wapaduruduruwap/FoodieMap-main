import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ReviewPageRoutingModule } from './review-page/review-page-routing.module';
import { YandexMapComponent } from './yandex-map/yandex-map.component'; // Импорт компонента карты


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, YandexMapComponent, ReactiveFormsModule, ReviewPageRoutingModule],
  template: `
    <h1>Welcome to {{title}}!</h1>
    
    <div class="map-container">
      <app-yandex-map />
    </div>

    <router-outlet />
  `,
  styles: [`
    .map-container {
      margin: 20px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
  `],
})
export class AppComponent {
  title = 'FoodieMap';
}
