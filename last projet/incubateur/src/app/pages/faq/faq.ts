import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class FaqComponent {
  faqCategories = [
    {
      title: 'Candidature et Sélection',
      icon: 'app_registration',
      questions: [
        {
          question: 'Qui peut candidater à l\'incubateur ?',
          answer: 'Toute personne majeure portant un projet à impact social, en particulier les habitants des quartiers prioritaires, les demandeurs d\'emploi et les créateurs d\'entreprises sociales. Aucun diplôme spécifique n\'est requis.'
        },
        {
          question: 'Quels types de projets sont acceptés ?',
          answer: 'Nous accompagnons des projets d\'insertion professionnelle, de création de micro-entreprises, de rénovation de logements sociaux, d\'économie circulaire, de services de proximité et toute initiative à forte utilité sociale.'
        },
        {
          question: 'Combien de temps dure le processus de sélection ?',
          answer: 'Le processus complet prend environ 6 semaines : 2 semaines pour l\'étude du dossier, 2 semaines pour les entretiens et évaluations, puis 2 semaines pour la décision finale du comité.'
        },
        {
          question: 'Quels sont les critères de sélection ?',
          answer: 'Nous évaluons l\'impact social du projet, la motivation du porteur, la faisabilité économique, l\'ancrage territorial et le potentiel de développement. La viabilité économique est importante mais pas exclusive.'
        }
      ]
    },
    {
      title: 'Accompagnement et Formation',
      icon: 'school',
      questions: [
        {
          question: 'Quelle est la durée de l\'accompagnement ?',
          answer: 'L\'accompagnement intensif dure 6 mois, suivi d\'un suivi personnalisé pendant 18 mois supplémentaires. Vous restez ensuite membre du réseau Alumni avec accès aux ressources et événements.'
        },
        {
          question: 'Quels sont les modules de formation proposés ?',
          answer: 'Business plan, marketing digital, gestion financière, aspects juridiques, management d\'équipe, développement durable, communication et pitch. Les formations sont adaptées aux besoins spécifiques de chaque projet.'
        },
        {
          question: 'L\'accompagnement est-il gratuit ?',
          answer: 'Oui, l\'ensemble de l\'accompagnement (coaching, formations, mise en réseau) est entièrement gratuit. Notre modèle est financé par nos partenaires publics et privés ainsi que par les retours sur investissement.'
        },
        {
          question: 'Puis-je bénéficier d\'un accompagnement à distance ?',
          answer: 'Nous proposons un format hybride : sessions en présentiel pour les ateliers collectifs et le réseau, et accompagnement individuel possible en visioconférence selon vos contraintes géographiques.'
        }
      ]
    },
    {
      title: 'Financement et Investissement',
      icon: 'payments',
      questions: [
        {
          question: 'Quels types de financement proposez-vous ?',
          answer: 'Prêts d\'honneur (0% d\'intérêt), microcrédit solidaire, financement participatif citoyen, subventions partenaires et dans certains cas, investissement en capital pour les projets à fort potentiel.'
        },
        {
          question: 'Quel est le montant maximum de financement ?',
          answer: 'Entre 5 000€ et 50 000€ selon la nature du projet. Les prêts d\'honneur vont jusqu\'à 15 000€, les microcrédits jusqu\'à 25 000€ et l\'investissement participatif peut atteindre 50 000€.'
        },
        {
          question: 'Comment fonctionne le financement participatif citoyen ?',
          answer: 'Les citoyens et entreprises de notre réseau peuvent investir dans votre projet via notre plateforme sécurisée. Ils bénéficient d\'un retour sur investissement éthique et participent au développement local.'
        },
        {
          question: 'Y a-t-il des garanties demandées ?',
          answer: 'Pour les prêts d\'honneur, aucune garantie matérielle n\'est exigée, seul votre engagement moral compte. Pour les microcrédits, nous étudions au cas par cas avec des garanties adaptées à votre situation.'
        }
      ]
    },
    {
      title: 'Réseau et Partenaires',
      icon: 'device_hub',
      questions: [
        {
          question: 'Comment fonctionne le réseau d\'entrepreneurs ?',
          answer: 'Vous intégrez une communauté de 150+ entrepreneurs solidaires, avec accès à des événements mensuels, un groupe privé d\'échanges, des sessions de co-développement et du mentorat entre pairs.'
        },
        {
          question: 'Quels sont vos partenaires institutionnels ?',
          answer: 'Nous travaillons avec les collectivités locales, Pôle Emploi, les CAF, les bailleurs sociaux, les associations de quartier et un réseau d\'entreprises socialement responsables.'
        },
        {
          question: 'Puis-je accéder à vos locaux ?',
          answer: 'Oui, nos espaces de coworking sont ouverts aux entrepreneurs accompagnés : salles de réunion, espaces de travail partagés, et lieu de rencontre avec la communauté. Réservation via notre plateforme.'
        },
        {
          question: 'Comment puis-je devenir mentor ou expert ?',
          answer: 'Si vous avez une expertise (juridique, marketing, finance, etc.) et souhaitez contribuer bénévolement, contactez-nous. Nous organisons des formations pour nos mentors et facilitons les rencontres.'
        }
      ]
    }
  ];

  quickActions = [
    {
      title: 'Candidater',
      description: 'Déposez votre projet',
      icon: 'app_registration',
      link: '/candidature',
      color: 'primary'
    },
    {
      title: 'Nous contacter',
      description: 'Une question spécifique ?',
      icon: 'support_agent',
      link: '/contact',
      color: 'primary'
    },
    {
      title: 'Découvrir nos projets',
      description: 'Voir les réussites',
      icon: 'workspace_premium',
      link: '/projets',
      color: 'primary'
    }
  ];
}

