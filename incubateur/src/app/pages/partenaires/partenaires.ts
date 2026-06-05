import {
  Component,
  OnDestroy,
  ElementRef,
  afterNextRender,
  Injector,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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
export class PartenairesComponent implements OnDestroy {
  private lenis?: Lenis;
  private tickerFn?: (time: number) => void;
  private cleanups: Array<() => void> = [];
  private reduced = false;

  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  constructor() {
    // Toute la cinétique se câble après le 1er rendu, côté navigateur.
    afterNextRender(() => this.initMotion(), { injector: this.injector });
  }

  // =========================================================
  //  MOTION — même grammaire que l'accueil : trajectoire d'or
  //  qui se trace, reveals bas→haut, CTA magnétique.
  // =========================================================
  private initMotion() {
    this.reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const root = this.host.nativeElement as HTMLElement;

    if (this.reduced) {
      // Contenu visible d'emblée, trajectoire pleinement tracée.
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      root.querySelectorAll<SVGPathElement>('.trajectory-path').forEach(p => {
        p.style.strokeDashoffset = '0';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

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
      this.buildReveals(root);
      this.buildMagnetic(root);
    }, root);
    this.cleanups.push(() => ctx.revert());

    requestAnimationFrame(() => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 600);
  }

  // Décollage : la trajectoire du hero se trace, le titre monte.
  private buildHeroIntro(root: HTMLElement) {
    const heroPath = root.querySelector<SVGPathElement>('.hero-trajectory');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroPath) {
      const len = heroPath.getTotalLength();
      gsap.set(heroPath, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(heroPath, { strokeDashoffset: 0, duration: 1.2, ease: 'expo.out' }, 0);
    }

    tl.from('.hero-halo', { opacity: 0, scale: 0.7, duration: 0.7 }, 0.3)
      .from('.hero-eyebrow', { y: 18, opacity: 0, duration: 0.6 }, 0.25)
      .from('.hero-title .line-inner', { yPercent: 110, duration: 0.9, stagger: 0.09, ease: 'expo.out' }, 0.4)
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, 0.9);
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
    this.lenis?.destroy();
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  // =========================================================
  //  CONTENU — catégories génériques (pas de partenaires réels
  //  ni de logos tant qu'ils ne sont pas confirmés par F.A.T.E.)
  // =========================================================
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
