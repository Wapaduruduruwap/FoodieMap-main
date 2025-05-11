import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Visit {
  id: string;
  restaurantName: string;
  visitDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private visitedRestaurants = new BehaviorSubject<string[]>([]);
  visitedRestaurants$ = this.visitedRestaurants.asObservable();
  private visitsKey = 'user_visits';
  private visits$ = new BehaviorSubject<Visit[]>(this.getStoredVisits());

  constructor() {
    // Загружаем из localStorage при инициализации
    const savedVisits = localStorage.getItem('visitedRestaurants');
    if (savedVisits) {
      this.visitedRestaurants.next(JSON.parse(savedVisits));
    }
  }

  private getStoredVisits(): Visit[] {
    const visitsJson = localStorage.getItem(this.visitsKey);
    return visitsJson ? JSON.parse(visitsJson) : [];
  }

  private saveVisits(visits: Visit[]): void {
    localStorage.setItem(this.visitsKey, JSON.stringify(visits));
  }

  clearVisits(): Observable<void> {
    localStorage.removeItem(this.visitsKey);
    localStorage.removeItem('visitedRestaurants');
    this.visits$.next([]);
    this.visitedRestaurants.next([]);
    return of(undefined);
  }

  addVisit(restaurantName: string): void {
    const currentVisits = this.visitedRestaurants.value;
    if (!currentVisits.includes(restaurantName)) {
      const updatedVisits = [...currentVisits, restaurantName];
      this.visitedRestaurants.next(updatedVisits);
      localStorage.setItem('visitedRestaurants', JSON.stringify(updatedVisits));

      // Также добавляем в visits$ с полной информацией
      const visits = this.getStoredVisits();
      const newVisit: Visit = {
        id: Date.now().toString(),
        restaurantName,
        visitDate: new Date()
      };
      this.visits$.next([...visits, newVisit]);
      this.saveVisits([...visits, newVisit]);
    }
  }

  getVisits(): Observable<Visit[]> {
    return this.visits$.asObservable();
  }

  getSimpleVisits(): string[] {
    return this.visitedRestaurants.value;
  }

  removeVisit(visitId: string): void {
    const visits = this.getStoredVisits().filter(v => v.id !== visitId);
    this.saveVisits(visits);
    this.visits$.next(visits);

    // Обновляем simplified версию
    this.visitedRestaurants.next(visits.map(v => v.restaurantName));
    localStorage.setItem('visitedRestaurants', JSON.stringify(visits.map(v => v.restaurantName)));
  }
}