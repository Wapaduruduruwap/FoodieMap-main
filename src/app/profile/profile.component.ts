import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent {
  profileForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  isEditing = false;

  visitedRestaurants = [
    'Pasta House',
    'Sushi Bar Kyoto',
    'Burger King',
    'Taco Fiesta'
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['Иван Иванов', Validators.required],
      email: ['ivan@example.com', [Validators.required, Validators.email]],
      avatar: [null]
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({ avatar: file });
      const reader = new FileReader();
      reader.onload = e => this.avatarPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Submitted:', this.profileForm.value);
      this.toggleEdit();
    }
  }
}
