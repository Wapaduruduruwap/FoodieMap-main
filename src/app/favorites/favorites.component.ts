import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoriteRestaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  sortBy: 'rating' | 'dateAdded' = 'rating';
  selectedCuisines: string[] = [];
  maxDistance: number | undefined;
  userLocation: [number, number] | null = null;
  isLoading: boolean = false;
  cuisineTypes: string[] = [];

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.cuisineTypes = this.restaurantService.getAllCuisineTypes();
    this.getUserLocation();
  }

  private loadFavorites(): void {
    this.isLoading = true;
    // В реальном приложении здесь бы был запрос к API для получения избранных
    // Пока используем localStorage для демонстрации
    const favorites = localStorage.getItem('favoriteRestaurants');
    if (favorites) {
      this.favoriteRestaurants = JSON.parse(favorites);
      this.filteredRestaurants = [...this.favoriteRestaurants];
      this.sortRestaurants();
    }
    this.isLoading = false;
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [position.coords.latitude, position.coords.longitude];
        //   this.calculateDistances();
          this.applyFilters();
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }

//   private calculateDistances(): void {
//     if (this.userLocation) {
//       this.favoriteRestaurants.forEach(restaurant => {
//         restaurant.distance = this.restaurantService.getDistance(
//           this.userLocation![0], this.userLocation![1],
//           restaurant.coordinates[0], restaurant.coordinates[1]
//         );
//       });
//       this.sortRestaurants();
//     }
//   }

  removeFromFavorites(restaurantId: number): void {
    this.favoriteRestaurants = this.favoriteRestaurants.filter(r => r.id !== restaurantId);
    this.filteredRestaurants = this.filteredRestaurants.filter(r => r.id !== restaurantId);
    localStorage.setItem('favoriteRestaurants', JSON.stringify(this.favoriteRestaurants));
  }

  toggleCuisineFilter(cuisine: string): void {
    const index = this.selectedCuisines.indexOf(cuisine);
    if (index === -1) {
      this.selectedCuisines.push(cuisine);
    } else {
      this.selectedCuisines.splice(index, 1);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.favoriteRestaurants];

    // Фильтр по типу кухни
    if (this.selectedCuisines.length > 0) {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisineType.some(cuisine => this.selectedCuisines.includes(cuisine)))
    }

    // Фильтр по расстоянию
    if (this.maxDistance !== undefined && this.userLocation) {
      filtered = filtered.filter(restaurant =>
        restaurant.distance !== undefined && restaurant.distance <= this.maxDistance!)
    }

    this.filteredRestaurants = filtered;
    this.sortRestaurants();
  }

  sortRestaurants(): void {
    if (this.sortBy === 'rating') {
      this.filteredRestaurants.sort((a, b) => b.rating - a.rating);
    } else {
      // В реальном приложении здесь бы использовалась дата добавления
      this.filteredRestaurants.sort((a, b) => b.id - a.id); // временная сортировка по ID
    }
  }

  onSortChange(sortBy: 'rating' | 'dateAdded'): void {
    this.sortBy = sortBy;
    this.sortRestaurants();
  }

  onDistanceChange(maxDistance: number | undefined): void {
    this.maxDistance = maxDistance;
    this.applyFilters();
  }
}