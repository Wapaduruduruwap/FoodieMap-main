import { Routes } from '@angular/router';
import { ReviewComponent } from './review-page/review-page/component/reviews.component';

export const routes: Routes = [
  { path: 'reviews', component: ReviewComponent }, // <-- Маршрут для страницы отзывов
  { path: '', redirectTo: '/reviews', pathMatch: 'full' } // Редирект на /reviews (опционально)
];

