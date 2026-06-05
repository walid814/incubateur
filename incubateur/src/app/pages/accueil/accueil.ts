import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  afterNextRender,
  Injector,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.scss']
})
export class AccueilComponent implements OnInit, OnDestroy {
  showCelebration = false;

  private lenis?: Lenis;
  private tickerFn?: (time: number) => void;
  private rafId?: number;
  private cleanups: Array<() => void> = [];
  private reduced = false;

  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    // Toute la cinétique se câble après le 1er rendu (DOM peint) côté navigateur.
    afterNextRender(() => this.initMotion(), { injector: this.injector });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['candidature'] === 'success') {
        setTimeout(() => {
          this.showSuccessMessage();
          this.router.navigate(['/'], { replaceUrl: true });
        }, 500);
      }
    });
  }

  // =========================================================
  //  MOTION — trajectoire d'or, reveals bas→haut, count-up, magnetic
  // =========================================================
  private initMotion() {
    this.reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const root = this.host.nativeElement as HTMLElement;

    if (this.reduced) {
      // Accessibilité : pas de scrub ni de traçage. Contenu visible d'emblée,
      // ligne d'or pleinement tracée, chiffres à leur valeur finale.
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      root.querySelectorAll<SVGPathElement>('.trajectory-path').forEach(p => {
        p.style.strokeDashoffset = '0';
      });
      root.querySelectorAll<HTMLElement>('.step-node').forEach(n =>
        n.classList.add('is-lit')
      );
      root.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
        el.textContent = this.formatCount(el);
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ---- Lenis smooth scroll, synchronisé à ScrollTrigger ----
    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    this.lenis.on('scroll', ScrollTrigger.update);
    this.tickerFn = (time: number) => this.lenis?.raf(time * 1000);
    gsap.ticker.add(this.tickerFn);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      this.buildHeroIntro(root);
      this.buildTrajectoryScrub(root);
      this.buildReveals(root);
      this.buildStepNodes(root);
      this.buildCountUp(root);
      this.buildMagnetic(root);
    }, root);
    this.cleanups.push(() => ctx.revert());

    // Le layout exact dépend des fonts/SVG → refresh après stabilisation.
    requestAnimationFrame(() => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 600);
  }

  // Décollage : la trajectoire du hero se trace, le titre monte, le halo pulse.
  private buildHeroIntro(root: HTMLElement) {
    const heroPath = root.querySelector<SVGPathElement>('.hero-trajectory');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // GSAP n'a pas de cubic-bezier natif ; expo.out reproduit (.22,1,.36,1).
    if (heroPath) {
      const len = heroPath.getTotalLength();
      gsap.set(heroPath, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(heroPath, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'expo.out'
      }, 0);
    }

    tl.from('.hero-bird', { opacity: 0, scale: 0.6, duration: 0.5, ease: 'back.out(2)' }, 0.9)
      .from('.hero-halo', { opacity: 0, scale: 0.7, duration: 0.7 }, 0.4)
      .to('.hero-halo', { scale: 1.08, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.05)
      .from('.hero-eyebrow', { y: 18, opacity: 0, duration: 0.6 }, 0.25)
      .from('.hero-title .line-inner', { yPercent: 110, duration: 0.9, stagger: 0.09, ease: 'expo.out' }, 0.45)
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, 1.0)
      .from('.hero-actions > *', { y: 18, opacity: 0, duration: 0.6, stagger: 0.1 }, 1.15)
      .from('.hero-scroll-hint', { opacity: 0, duration: 0.6 }, 1.4);
  }

  // Effet signature : la ligne d'or maîtresse continue de se tracer au scroll.
  private buildTrajectoryScrub(root: HTMLElement) {
    const spine = root.querySelector<SVGPathElement>('.spine-path');
    const spineWrap = root.querySelector<HTMLElement>('.trajectory-spine');
    if (!spine || !spineWrap) return;

    const len = spine.getTotalLength();
    gsap.set(spine, { strokeDasharray: len, strokeDashoffset: len });

    gsap.to(spine, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: spineWrap,
        start: 'top 70%',
        end: 'bottom 75%',
        scrub: 0.8
      }
    });
  }

  // Reveals de bas en haut, stagger doux.
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

  // Chaque étape du parcours s'allume en or quand elle entre dans le viewport.
  private buildStepNodes(root: HTMLElement) {
    gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.step-node')).forEach(node => {
      ScrollTrigger.create({
        trigger: node,
        start: 'top 75%',
        onEnter: () => node.classList.add('is-lit'),
        onLeaveBack: () => node.classList.remove('is-lit')
      });
    });
  }

  // Compteurs chiffres-clés.
  private buildCountUp(root: HTMLElement) {
    gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-count]')).forEach(el => {
      const target = parseFloat(el.dataset['count'] || '0');
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = this.formatCount(el, obj.v);
            }
          });
        }
      });
    });
  }

  private formatCount(el: HTMLElement, current?: number): string {
    const target = parseFloat(el.dataset['count'] || '0');
    const value = current ?? target;
    const decimals = parseInt(el.dataset['decimals'] || '0', 10);
    const prefix = el.dataset['prefix'] || '';
    const suffix = el.dataset['suffix'] || '';
    return prefix + value.toFixed(decimals) + suffix;
  }

  // Micro-interaction : CTA magnétique léger.
  private buildMagnetic(root: HTMLElement) {
    const buttons = root.querySelectorAll<HTMLElement>('[data-magnetic]');
    buttons.forEach(btn => {
      const strength = 0.28;
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
    if (this.tickerFn) gsap.ticker.remove(this.tickerFn);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lenis?.destroy();
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  private showSuccessMessage() {
    this.showCelebration = true;
    this.notificationService.showCelebration(
      'Candidature envoyée avec succès',
      'Merci pour votre confiance. Notre équipe examine votre dossier et vous recontacte sous 48h.',
      12000
    );
    setTimeout(() => (this.showCelebration = false), 8000);
  }

  // =========================================================
  //  CONTENU — repris à l'identique de la page existante
  // =========================================================
  piliers = [
    {
      num: '01',
      icon: 'volunteer_activism',
      title: "Soutenir l'innovation sociale",
      description:
        "Identifier et financer des projets portés par des habitants de quartiers défavorisés : insertion par l'activité économique, création de micro-entreprises, rénovation de logements sociaux."
    },
    {
      num: '02',
      icon: 'diversity_3',
      title: 'Renforcer la cohésion locale',
      description:
        "Créer un réseau d'échange et d'entraide entre porteurs de projets, associations, financeurs et acteurs locaux engagés."
    },
    {
      num: '03',
      icon: 'payments',
      title: "Valoriser l'épargne citoyenne",
      description:
        "Proposer aux particuliers et entreprises une offre d'investissement à impact social, labellisée et transparente."
    }
  ];

  steps = [
    {
      icon: 'app_registration',
      title: 'Admission',
      description:
        'Intégration dans notre écosystème après validation de votre profil et de vos motivations.'
    },
    {
      icon: 'tips_and_updates',
      title: 'Conceptualisation',
      description:
        'Développement et structuration de votre idée avec nos experts sectoriels.'
    },
    {
      icon: 'school',
      title: 'Formation',
      description:
        'Programme personnalisé : business plan, juridique, marketing et gestion financière.'
    },
    {
      icon: 'payments',
      title: 'Financement',
      description:
        'Accès aux financements solidaires et mise en relation avec les investisseurs.'
    },
    {
      icon: 'flight_takeoff',
      title: 'Lancement',
      description:
        'Accompagnement opérationnel et suivi continu de votre projet sur le terrain.'
    }
  ];

  successFactors = [
    {
      icon: 'psychology',
      title: 'Adéquation marché-produit',
      description:
        'Compréhension approfondie des besoins réels du marché et adaptation de votre solution en conséquence.'
    },
    {
      icon: 'diversity_3',
      title: 'Équipe complémentaire',
      description:
        "Constitution d'une équipe pluridisciplinaire aux compétences techniques, commerciales et sectorielles."
    },
    {
      icon: 'trending_up',
      title: 'Modèle économique viable',
      description:
        "Développement d'un modèle économique robuste alliant rentabilité et impact social positif."
    },
    {
      icon: 'support',
      title: 'Accompagnement personnalisé',
      description:
        "Bénéfice d'un mentorat expert et d'un réseau professionnel pour accélérer votre développement."
    }
  ];

  projectTypes = [
    {
      icon: 'recycling',
      title: 'Économie circulaire',
      description:
        "Réutilisation, recyclage, upcycling et réduction des déchets pour un impact environnemental positif.",
      examples: ['Recyclage innovant', 'Agriculture urbaine', 'Réparation collaborative']
    },
    {
      icon: 'health_and_safety',
      title: 'Santé & bien-être',
      description:
        "Solutions pour améliorer l'accès aux soins, la prévention santé et le bien-être des communautés.",
      examples: ['Télémédecine solidaire', 'Prévention santé', 'Aide aux aidants']
    },
    {
      icon: 'school',
      title: 'Éducation & formation',
      description:
        "Initiatives pour démocratiser l'accès à l'éducation, la formation professionnelle et l'insertion.",
      examples: ['Formation numérique', 'Orientation professionnelle', 'Alphabétisation']
    },
    {
      icon: 'home',
      title: 'Cohésion sociale',
      description:
        "Projets renforçant le lien social, l'entraide communautaire et l'inclusion des populations vulnérables.",
      examples: ['Logement participatif', 'Services de proximité', 'Médiation sociale']
    }
  ];
}
