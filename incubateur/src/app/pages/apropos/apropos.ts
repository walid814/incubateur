import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-apropos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './apropos.html',
  styleUrls: ['./apropos.scss']
})
export class AproposComponent {
  stats = [
    {
      number: '0+',
      label: 'Projets accompagnés',
      icon: 'trending_up'
    },
    {
      number: '0%',
      label: 'Taux de réussite',
      icon: 'verified_user'
    },
    {
      number: '0+',
      label: 'Experts mobilisés',
      icon: 'groups_2'
    },
    {
      number: '0M€',
      label: 'Financements solidaires',
      icon: 'payments'
    }
  ];

  team = [
    {
      name: 'Sarah Dubois',
      role: 'Directeur Général',
      description: 'Experte en économie sociale et solidaire, 25 ans d\'expérience dans l\'accompagnement .',
      image: 'person',
      linkedin: '#'
    },
  ];

  values = [
    {
      title: 'Solidarité',
      description: 'Nous croyons en la force du collectif et de l\'entraide pour transformer les territoires.',
      icon: 'diversity_3'
    },
    {
      title: 'Innovation Sociale',
      description: 'Nous soutenons les solutions innovantes qui répondent aux défis sociaux et environnementaux.',
      icon: 'emoji_objects'
    },
    {
      title: 'Équité',
      description: 'Nous garantissons un accès équitable à l\'entrepreneuriat, quelle que soit l\'origine sociale.',
      icon: 'gavel'
    },
    {
      title: 'Impact',
      description: 'Nous mesurons notre réussite à l\'aune de l\'impact social et territorial de nos actions.',
      icon: 'query_stats'
    }
  ];
}

