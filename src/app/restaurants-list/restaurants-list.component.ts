import { Component } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-restaurants-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurants-list.component.html',
  styleUrls: ['./restaurants-list.component.css']
})
export class RestaurantsListComponent {
  restaurants: Restaurant[] = [];

  constructor(private restaurantService: RestaurantService) {
    this.restaurantService.getAllRestaurants().subscribe(restaurants => {
      this.restaurants = restaurants;
    });
  }
}