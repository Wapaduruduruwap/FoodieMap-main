import { Routes } from '@angular/router';
import { ReviewComponent } from './review-page/review-page/component/reviews.component';
import { AddRestaurantComponent } from './add-restaurant/add-restaurant.component';

export const routes: Routes = [
  { path: 'reviews', component: ReviewComponent }, // <-- Маршрут для страницы отзывов
  { path: 'add-restaurant', component: AddRestaurantComponent }, // <-- Маршрут для страницы добавления ресторана
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule)
  },
  { path: '', redirectTo: '/reviews', pathMatch: 'full' } // Редирект на /reviews (опционально)
];
