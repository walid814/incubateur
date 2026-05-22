import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.scss']
})
export class AccueilComponent implements OnInit {
  showCelebration = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Vérifier si l'utilisateur arrive depuis la candidature via les query parameters
    this.route.queryParams.subscribe(params => {
      if (params['candidature'] === 'success') {
        // Petite attente pour laisser la page se charger complètement
        setTimeout(() => {
          this.showSuccessMessage();
          // Nettoyer l'URL après avoir affiché la notification
          this.router.navigate(['/'], { replaceUrl: true });
        }, 500);
      }
    });
  }

  private showSuccessMessage() {
    // Activer l'animation de célébration
    this.showCelebration = true;
    
    // Afficher la notification spéciale
    this.notificationService.showCelebration(
      '🎉 Candidature envoyée avec succès !',
      'Merci pour votre confiance ! Notre équipe va examiner votre dossier et vous contacter sous 48h.',
      12000 // 12 secondes pour une notification spéciale
    );

    // Désactiver l'animation après un certain temps
    setTimeout(() => {
      this.showCelebration = false;
    }, 8000);
  }

  services = [
    {
      icon: 'app_registration',
      title: 'Admission',
      description: 'Intégration dans notre écosystème après validation de votre profil et de vos motivations.'
    },
    {
      icon: 'tips_and_updates',
      title: 'Conceptualisation',
      description: 'Développement et structuration de votre idée avec nos experts sectoriels.'
    },
    {
      icon: 'school',
      title: 'Formation',
      description: 'Programme personnalisé : business plan, juridique, marketing et gestion financière.'
    },
    {
      icon: 'payments',
      title: 'Financement',
      description: 'Accès aux financements solidaires et mise en relation avec les investisseurs.'
    },
    {
      icon: 'flight_takeoff',
      title: 'Lancement',
      description: 'Accompagnement opérationnel et suivi continu de votre projet sur le terrain.'
    }
  ];

  processSteps = [
    {
      icon: 'upload',
      title: 'Soumission de Projet',
      description: 'Déposez votre dossier complet via notre plateforme avec présentation détaillée de votre concept et équipe.'
    },
    {
      icon: 'psychology',
      title: 'Étude et Accompagnement',
      description: 'Analyse approfondie de votre projet par nos experts et coaching personnalisé pour le structurer.'
    },
    {
      icon: 'campaign',
      title: 'Lancement de l\'Appel à Projet',
      description: 'Présentation publique de votre initiative auprès de notre communauté d\'investisseurs solidaires.'
    },
    {
      icon: 'folder_shared',
      title: 'Dépôt de Projet Finalisé',
      description: 'Soumission du business plan définitif avec budget détaillé et plan de développement.'
    },
    {
      icon: 'rule',
      title: 'Instruction du Projet',
      description: 'Évaluation rigoureuse par le comité de sélection : viabilité économique, impact social, équipe.'
    },
    {
      icon: 'account_balance',
      title: 'Financement',
      description: 'Attribution des financements solidaires : prêts d\'honneur, subventions, investissement participatif.'
    },
    {
      icon: 'flight_takeoff',
      title: 'Réalisation',
      description: 'Lancement opérationnel de votre projet avec accompagnement technique et commercial continu.'
    },
    {
      icon: 'analytics',
      title: 'Évaluation Régulière',
      description: 'Suivi des indicateurs d\'impact, bilans trimestriels et ajustements stratégiques avec votre coach.'
    }
  ];

  successFactors = [
    {
      icon: 'psychology',
      title: 'Adéquation Marché-Produit',
      description: 'Compréhension approfondie des besoins réels du marché et adaptation de votre solution en conséquence.'
    },
    {
      icon: 'diversity_3',
      title: 'Équipe Complémentaire',
      description: 'Constitution d\'une équipe pluridisciplinaire avec des compétences techniques, commerciales et sectorielles.'
    },
    {
      icon: 'trending_up',
      title: 'Modèle Économique Viable',
      description: 'Développement d\'un modèle économique robuste alliant rentabilité et impact social positif.'
    },
    {
      icon: 'support',
      title: 'Accompagnement Personnalisé',
      description: 'Bénéfice d\'un mentorat expert et d\'un réseau professionnel pour accélérer votre développement.'
    }
  ];

  projectTypes = [
    {
      icon: 'recycling',
      title: 'Économie Circulaire',
      description: 'Projets de réutilisation, recyclage, upcycling et réduction des déchets pour un impact environnemental positif.',
      examples: ['Recyclage innovant', 'Agriculture urbaine', 'Réparation collaborative']
    },
    {
      icon: 'health_and_safety',
      title: 'Santé & Bien-être',
      description: 'Solutions pour améliorer l\'accès aux soins, la prévention santé et le bien-être des communautés.',
      examples: ['Télémédecine solidaire', 'Prévention santé', 'Aide aux aidants']
    },
    {
      icon: 'school',
      title: 'Éducation & Formation',
      description: 'Initiatives pour démocratiser l\'accès à l\'éducation, la formation professionnelle et l\'insertion.',
      examples: ['Formation numérique', 'Orientation professionnelle', 'Alphabétisation']
    },
    {
      icon: 'home',
      title: 'Cohésion Sociale',
      description: 'Projets renforçant le lien social, l\'entraide communautaire et l\'inclusion des populations vulnérables.',
      examples: ['Logement participatif', 'Services de proximité', 'Médiation sociale']
    }
  ];
}

