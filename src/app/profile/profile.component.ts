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
  visitedRestaurants: string[] = [];

  constructor(
    private fb: FormBuilder,
    private visitService: VisitService) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar: [null]
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
    this.visitedRestaurants = this.visitService.getVisits();
    
    // Если посещений нет, используем демо-данные
    if (this.visitedRestaurants.length === 0) {
      this.visitedRestaurants = [
        'Pasta House',
        'Sushi Bar Kyoto',
        'Burger King',
        'Taco Fiesta'
      ];
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