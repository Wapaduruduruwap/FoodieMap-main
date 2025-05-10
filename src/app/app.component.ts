import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ReviewPageRoutingModule } from './review-page/review-page-routing.module';
import { YandexMapComponent } from './yandex-map/yandex-map.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, YandexMapComponent, ReactiveFormsModule, ReviewPageRoutingModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'FoodieMap';
}
