import {
  Component,
  OnDestroy,
  ElementRef,
  afterNextRender,
  Injector,
  inject
} from '@angular/core';
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

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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
export class ContactComponent implements OnDestroy {
  contactForm: FormGroup;

  private lenis?: Lenis;
  private tickerFn?: (time: number) => void;
  private cleanups: Array<() => void> = [];
  private reduced = false;

  private host = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  contactInfo = [
    {
      title: 'Bureau Principal',
      address: '37, rue de la Solidarité',
      city: '93000 Bobigny',
      schedule: 'Lundi au vendredi : 9h00 - 17h00',
      icon: 'location_on',
      phone: '01 23 45 67 89',
      email: 'contact@envolimpact.fr'
    },
    {
      title: 'Antenne Sud',
      address: '15, avenue de l\'Entrepreneuriat',
      city: '13001 Marseille',
      schedule: 'Lundi, mercredi, vendredi : 14h00 - 18h00',
      icon: 'location_on',
      phone: '04 91 23 45 67',
      email: 'marseille@envolimpact.fr'
    }
  ];

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

    // Cinétique câblée après le 1er rendu (DOM peint), côté navigateur.
    afterNextRender(() => this.initMotion(), { injector: this.injector });
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

  // =========================================================
  //  MOTION — reprend le moteur de l'accueil : trajectoire
  //  d'or au hero, reveals bas→haut, CTA magnétique.
  // =========================================================
  private initMotion() {
    this.reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const root = this.host.nativeElement as HTMLElement;

    if (this.reduced) {
      // Accessibilité : contenu visible d'emblée, trajectoire tracée, pas de scrub.
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      root.querySelectorAll<HTMLElement>('[data-reveal-child]').forEach(el => {
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
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });
  }

  private buildMagnetic(root: HTMLElement) {
    const buttons = root.querySelectorAll<HTMLElement>('[data-magnetic]');
    buttons.forEach(btn => {
      const strength = 0.2;
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
}
