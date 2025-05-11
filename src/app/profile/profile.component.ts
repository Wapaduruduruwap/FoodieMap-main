// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';


// @Component({
//   selector: 'app-profile',
//   templateUrl: './profile.component.html',
//   styleUrls: ['./profile.component.scss'],
//   standalone: false
// })
// export class ProfileComponent {
//   profileForm: FormGroup;
//   avatarPreview: string | ArrayBuffer | null = null;
//   isEditing = false;

//   visitedRestaurants = [
//     'Pasta House',
//     'Sushi Bar Kyoto',
//     'Burger King',
//     'Taco Fiesta'
//   ];

//   constructor(private fb: FormBuilder) {
//     this.profileForm = this.fb.group({
//       name: ['Иван Иванов', Validators.required],
//       email: ['ivan@example.com', [Validators.required, Validators.email]],
//       avatar: [null]
//     });
//   }

//   toggleEdit(): void {
//     this.isEditing = !this.isEditing;
//   }

//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//     if (file) {
//       this.profileForm.patchValue({ avatar: file });
//       const reader = new FileReader();
//       reader.onload = e => this.avatarPreview = reader.result;
//       reader.readAsDataURL(file);
//     }
//   }

//   onSubmit(): void {
//     if (this.profileForm.valid) {
//       console.log('Submitted:', this.profileForm.value);
//       this.toggleEdit();
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitService } from '../services/visit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  isEditing = false;
  // visitedRestaurants: string[] = [];
  visitedRestaurants: string[] = []; // Используем массив строк
  // visitedRestaurants$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private snackBar: MatSnackBar) {
    this.profileForm = this.fb.group({
      // this.loadVisitHistory();
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar: [null],
    });
  }
  
  ngOnInit(): void {
    this.loadProfileData();
    this.loadVisitHistory();
  }

  private loadProfileData(): void {
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
      const { name, email, avatar } = JSON.parse(savedData);
      this.profileForm.patchValue({ name, email });
      this.avatarPreview = avatar;
    } else {
      // Значения по умолчанию
      this.profileForm.patchValue({
        name: 'Иван Иванов',
        email: 'ivan@example.com'
      });
    }
  }

  private loadVisitHistory(): void {
    // Загружаем данные через сервис
    this.visitService.getVisits().pipe(
      map(visits => visits.map(v => v.restaurantName))
    ).subscribe(restaurants => {
      this.visitedRestaurants = restaurants;
      
      // Если нет посещений, используем демо-данные
      // if (this.visitedRestaurants.length === 0) {
      //   this.visitedRestaurants = [
      //     'Pasta House',
      //     'Sushi Bar Kyoto',
      //     'Burger King',
      //     'Taco Fiesta'
      //   ];
      // }
    });
  }
  
  clearHistory(): void {
    if (confirm('Вы уверены, что хотите очистить историю посещений?')) {
      this.visitService.clearVisits().subscribe({
        next: () => {
          this.visitedRestaurants = [];
          this.snackBar.open('История посещений очищена', 'Закрыть', {
            duration: 3000
          });
        },
        error: () => {
          this.snackBar.open('Ошибка при очистке истории', 'Закрыть', {
            duration: 3000
          });
        }
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({ avatar: file });
      const reader = new FileReader();
      reader.onload = e => this.avatarPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const profileData = {
        ...this.profileForm.value,
        avatar: this.avatarPreview
      };
      
      localStorage.setItem('profileData', JSON.stringify(profileData));
      this.toggleEdit();
    }
  }

  // Для тестирования - добавление нового посещения
  addNewVisit(place: string): void {
    this.visitedRestaurants.push(place);
    localStorage.setItem('visitHistory', JSON.stringify(this.visitedRestaurants));
  }
}