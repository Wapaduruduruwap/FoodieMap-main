import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // ← Добавь импорт
import { ReviewComponent } from './review-page/review-page/component/reviews.component';
import { AddRestaurantComponent } from './add-restaurant/add-restaurant.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { RestaurantDetailsComponent } from './restaurant-details/restaurant-details.component';
import { RestaurantsListComponent } from './restaurants-list/restaurants-list.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  { path: 'reviews', component: ReviewComponent },
  { path: 'add-restaurant', component: AddRestaurantComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'restaurants', component: RestaurantsListComponent },
  { path: 'restaurant/:id', component: RestaurantDetailsComponent },
];