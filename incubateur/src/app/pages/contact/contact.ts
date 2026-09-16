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
      address: '20 Rue Robert Desnos',
      city: '69120 Vaulx-en-Velin',
      schedule: 'Lundi au vendredi : 9h00 - 17h00',
      icon: 'location_on',
      phone: '+33 7 83 67 11 26',
      email: 'infosfatetousensemble@gmail.com',
      mapUrl: this.buildMapUrl('20 Rue Robert Desnos, 69120 Vaulx-En-Velin, France')
    },
    {
      title: 'Antenne Lyon',
      address: '14 avenue Berthelot',
      city: '69007 Lyon',
      schedule: 'Lundi, mercredi, vendredi : 14h00 - 18h00',
      icon: 'location_on',
      phone: '+33 9 51 18 34 96',
      email: 'art.afrovibes@gmail.com',
      mapUrl: this.buildMapUrl('14 avenue Berthelot, 69007 Lyon, France')
    }
  ];

  private buildMapUrl(address: string): string {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
  }

  contactReasons = [
    { value: 'candidature', label: 'Question sur ma candidature' },
    { value: 'financement', label: 'Informations sur le financement' },
    { value: 'partenariat', label: 'Proposition de partenariat' },
    { value: 'mentorat', label: 'Devenir mentor/expert' },
    { value: 'investissement', label: 'Investissement solidaire' },
    { value: 'presse', label: 'Demande presse/média' },
    { value: 'autre', label: 'Autre demande' }
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
