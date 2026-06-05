import {
  Component,
  OnDestroy,
  ElementRef,
  afterNextRender,
  Injector,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

@Component({
  selector: 'app-apropos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './apropos.html',
  styleUrls: ['./apropos.scss']
})
export class AproposComponent implements OnDestroy {
  private lenis?: Lenis;
  private tickerFn?: (time: number) => void;
  private cleanups: Array<() => void> = [];
  private reduced = false;

  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  constructor() {
    // Cinétique câblée après le 1er rendu (DOM peint), côté navigateur.
    afterNextRender(() => this.initMotion(), { injector: this.injector });
  }

  // =========================================================
  //  MOTION — reprend le moteur de l'accueil : trajectoire
  //  d'or au scroll, reveals bas→haut, CTA magnétiques.
  // =========================================================
  private initMotion() {
    this.reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const root = this.host.nativeElement as HTMLElement;

    if (this.reduced) {
      // Accessibilité : contenu visible d'emblée, ligne d'or tracée, pas de scrub.
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

    if (heroPath) {
      const len = heroPath.getTotalLength();
      gsap.set(heroPath, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(heroPath, { strokeDashoffset: 0, duration: 1.2, ease: 'expo.out' }, 0);
    }

    tl.from('.hero-halo', { opacity: 0, scale: 0.7, duration: 0.7 }, 0.4)
      .to('.hero-halo', { scale: 1.08, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.05)
      .from('.hero-eyebrow', { y: 18, opacity: 0, duration: 0.6 }, 0.25)
      .from('.hero-title .line-inner', { yPercent: 110, duration: 0.9, stagger: 0.09, ease: 'expo.out' }, 0.45)
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, 1.0);
  }

  // Effet signature : la ligne d'or maîtresse se trace au scroll.
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
  //  CONTENU
  // =========================================================
  stats = [
    { number: '[à confirmer]', label: 'Projets accompagnés', icon: 'trending_up' },
    { number: '[à confirmer]', label: 'Taux de réussite', icon: 'verified_user' },
    { number: '[à confirmer]', label: 'Experts mobilisés', icon: 'groups_2' },
    { number: '[à confirmer]', label: 'Financements solidaires', icon: 'payments' }
  ];

  values = [
    {
      title: 'Solidarité',
      description:
        "Nous croyons en la force du collectif et de l'entraide pour transformer les territoires.",
      icon: 'diversity_3'
    },
    {
      title: 'Innovation sociale',
      description:
        'Nous soutenons les solutions innovantes qui répondent aux défis sociaux et environnementaux.',
      icon: 'emoji_objects'
    },
    {
      title: 'Équité',
      description:
        "Nous garantissons un accès équitable à l'entrepreneuriat, quelle que soit l'origine sociale.",
      icon: 'gavel'
    },
    {
      title: 'Impact',
      description:
        "Nous mesurons notre réussite à l'aune de l'impact social et territorial de nos actions.",
      icon: 'query_stats'
    }
  ];
}
