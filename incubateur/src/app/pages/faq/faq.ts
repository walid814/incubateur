import {
  Component,
  OnDestroy,
  ElementRef,
  afterNextRender,
  Injector,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class FaqComponent implements OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);
  private cleanups: Array<() => void> = [];

  constructor() {
    // La cinétique se câble après le 1er rendu (DOM peint) côté navigateur.
    afterNextRender(() => this.initMotion(), { injector: this.injector });
  }

  // =========================================================
  //  MOTION — reveals au scroll + CTA magnétiques.
  //  Pattern repris de l'accueil, full respect reduced-motion.
  // =========================================================
  private initMotion() {
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const root = this.host.nativeElement as HTMLElement;

    if (reduced) {
      // Accessibilité : contenu visible d'emblée, aucune anim.
      root.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-child]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      this.buildReveals(root);
      this.buildMagnetic(root);
    }, root);
    this.cleanups.push(() => ctx.revert());

    // Le layout dépend des fonts → refresh après stabilisation.
    requestAnimationFrame(() => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 600);
  }

  // Reveals de bas en haut, stagger doux (identique à l'accueil).
  private buildReveals(root: HTMLElement) {
    const items = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('[data-reveal]')
    );
    items.forEach(el => {
      const group = el.querySelectorAll<HTMLElement>('[data-reveal-child]');
      const targets = group.length ? Array.from(group) : [el];
      gsap.from(targets, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
  }

  // Micro-interaction : liens/CTA magnétiques légers.
  private buildMagnetic(root: HTMLElement) {
    const buttons = root.querySelectorAll<HTMLElement>('[data-magnetic]');
    buttons.forEach(btn => {
      const strength = 0.22;
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out' });
      };
      const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      this.cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  ngOnDestroy() {
    this.cleanups.forEach(fn => fn());
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  // =========================================================
  //  CONTENU — repris à l'identique de la page existante
  // =========================================================
  faqCategories = [
    {
      title: 'Candidature et sélection',
      icon: 'app_registration',
      questions: [
        {
          question: 'Qui peut candidater à Envol Impact ?',
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
      title: 'Accompagnement et formation',
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
      title: 'Financement et investissement',
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
      title: 'Réseau et partenaires',
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
