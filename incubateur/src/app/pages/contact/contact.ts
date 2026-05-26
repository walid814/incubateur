import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class ContactComponent {
  contactForm: FormGroup;

  contactInfo = [
    {
      title: 'Bureau Principal',
      address: '37, rue de la Solidarité',
      city: '93000 Bobigny',
      schedule: 'Lundi au vendredi : 9h00 - 17h00',
      icon: 'location_on',
      phone: '01 23 45 67 89',
      email: 'contact@incubateur-solidaire.fr'
    },
    {
      title: 'Antenne Sud',
      address: '15, avenue de l\'Entrepreneuriat',
      city: '13001 Marseille',
      schedule: 'Lundi, mercredi, vendredi : 14h00 - 18h00',
      icon: 'location_on',
      phone: '04 91 23 45 67',
      email: 'marseille@incubateur-solidaire.fr'
    }
  ];

  contactReasons = [
    { value: 'candidature', label: 'Question sur ma candidature' },
    { value: 'financement', label: 'Informations sur le financement' },
    { value: 'partenariat', label: 'Proposition de partenariat' },
    { value: 'mentorat', label: 'Devenir mentor/expert' },
    { value: 'investissement', label: 'Investissement solidaire' },
    { value: 'presse', label: 'Demande presse/média' },
    { value: 'autre', label: 'Autre demande' }
  ];

  socialLinks = [
    { name: 'LinkedIn', icon: 'language', url: '#', color: '#0077b5' },
    { name: 'Twitter', icon: 'alternate_email', url: '#', color: '#1da1f2' },
    { name: 'Facebook', icon: 'groups_2', url: '#', color: '#4267b2' },
    { name: 'Instagram', icon: 'photo_camera', url: '#', color: '#e4405f' },
    { name: 'YouTube', icon: 'smart_display', url: '#', color: '#ff0000' }
  ];

  constructor(private fb: FormBuilder, private notify: NotificationService) {
    this.contactForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      sujet: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      // TODO: brancher l'envoi réel du formulaire au backend
      this.notify.showSuccess('Message envoyé', 'Merci ! Nous vous répondrons sous 24 h.');
      this.contactForm.reset();
    } else {
      this.notify.showWarning('Formulaire incomplet', 'Veuillez remplir les champs obligatoires.');
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    if (field?.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    return '';
  }
}

