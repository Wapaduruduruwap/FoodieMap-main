import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private visitedRestaurants = new BehaviorSubject<string[]>([]);
  visitedRestaurants$ = this.visitedRestaurants.asObservable();

  constructor() {
    // Загружаем из localStorage при инициализации
    const savedVisits = localStorage.getItem('visitedRestaurants');
    if (savedVisits) {
      this.visitedRestaurants.next(JSON.parse(savedVisits));
    }
  }

  addVisit(restaurantName: string) {
    const currentVisits = this.visitedRestaurants.value;
    if (!currentVisits.includes(restaurantName)) {
      const updatedVisits = [...currentVisits, restaurantName];
      this.visitedRestaurants.next(updatedVisits);
      localStorage.setItem('visitedRestaurants', JSON.stringify(updatedVisits));
    }
  }

  getVisits(): string[] {
    return this.visitedRestaurants.value;
  }
}