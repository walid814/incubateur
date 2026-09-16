import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'Accueil', route: '/' },
    { label: 'À propos', route: '/apropos' },
    { label: 'FAQ', route: '/faq' },
    { label: 'Contact', route: '/contact' },
    { label: 'Candidater', route: '/candidature' }
  ];

  services = [
    { label: 'Accompagnement', route: '/apropos' },
    { label: 'Formation', route: '/apropos' },
    { label: 'Financement', route: '/apropos' },
    { label: 'Réseau', route: '/apropos' },
    { label: 'Ressources', route: '/apropos' }
  ];

  socialLinks = [
    { name: 'LinkedIn', icon: 'language', url: '#' },
    { name: 'Twitter', icon: 'alternate_email', url: '#' },
    { name: 'Facebook', icon: 'groups_2', url: '#' },
    { name: 'Instagram', icon: 'photo_camera', url: '#' },
    { name: 'YouTube', icon: 'smart_display', url: '#' }
  ];

  contactInfo = {
    address: '20 Rue Robert Desnos, 69120 Vaulx-en-Velin, France',
    phone: '+33 7 83 67 11 26',
    email: 'infosfatetousensemble@gmail.com',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('20 Rue Robert Desnos, 69120 Vaulx-En-Velin, France')
  };
}

