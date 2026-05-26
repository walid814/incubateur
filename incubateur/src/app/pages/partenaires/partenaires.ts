import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-partenaires',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './partenaires.html',
  styleUrls: ['./partenaires.scss']
})
export class PartenairesComponent {
  // Catégories de partenaires de l'écosystème (à remplacer par des
  // partenaires réels + logos quand ils seront confirmés).
  institutionnels = [
    {
      icon: 'account_balance',
      title: 'Collectivités & acteurs publics',
      description: "Villes, départements et régions engagés dans le développement économique et l'insertion au sein des quartiers populaires."
    },
    {
      icon: 'gavel',
      title: "Services de l'État & dispositifs d'emploi",
      description: "Programmes publics d'aide à la création d'entreprise, à la formation et au retour à l'emploi sur le territoire."
    },
    {
      icon: 'home_work',
      title: 'Bailleurs sociaux',
      description: "Acteurs du logement social qui soutiennent la rénovation, l'animation et la vie économique des quartiers."
    }
  ];

  financiers = [
    {
      icon: 'savings',
      title: 'Banques & finance solidaire',
      description: "Établissements proposant des financements adaptés aux porteurs de projets à impact et aux structures de l'ESS."
    },
    {
      icon: 'volunteer_activism',
      title: 'Fondations & mécènes',
      description: "Organisations philanthropiques qui cofinancent l'accompagnement et l'amorçage des projets sociaux."
    },
    {
      icon: 'trending_up',
      title: 'Investisseurs à impact',
      description: "Investisseurs recherchant un rendement social et environnemental autant que financier."
    }
  ];
}
