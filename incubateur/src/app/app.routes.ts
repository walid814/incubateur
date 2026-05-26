import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/accueil/accueil').then(m => m.AccueilComponent)
  },
  {
    path: 'candidature',
    loadComponent: () => import('./pages/candidature/candidature').then(m => m.CandidatureComponent)
  },
  {
    path: 'partenaires',
    loadComponent: () => import('./pages/partenaires/partenaires').then(m => m.PartenairesComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/connexion/connexion').then(m => m.ConnexionComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'apropos',
    loadComponent: () => import('./pages/apropos/apropos').then(m => m.AproposComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq').then(m => m.FaqComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    // Bloc de garde désactivé temporairement pour autoriser l'accès public au dashboard.
    // canActivate: [AuthGuard]
  },
  {
    path: 'financement',
    loadComponent: () => import('./pages/financement/financement').then(m => m.FinancementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/candidatures',
    loadComponent: () => import('./pages/admin-candidatures/admin-candidatures').then(m => m.AdminCandidaturesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin-users/admin-users').then(m => m.AdminUsersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
