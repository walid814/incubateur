import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';
import { SocietaireGuard } from './services/societaire.guard';

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
  path: 'verify-email',
  loadComponent: () => import('./pages/verify-email/verify-email').then(m => m.VerifyEmailComponent)},
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./pages/mot-de-passe-oublie/mot-de-passe-oublie').then(m => m.MotDePasseOublieComponent)
  },
  {
    path: 'apropos',
    loadComponent: () => import('./pages/apropos/apropos').then(m => m.AproposComponent)
  },
  {
    path: 'engagements',
    loadComponent: () => import('./pages/engagements/engagements').then(m => m.EngagementsComponent)
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
    canActivate: [AuthGuard]
  },
  {
    path: 'candidatures',
    loadComponent: () => import('./pages/mes-candidatures/mes-candidatures').then(m => m.MesCandidaturesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'mes-projets',
    loadComponent: () => import('./pages/mes-projets/mes-projets').then(m => m.MesProjetsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./pages/documents/documents').then(m => m.DocumentsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'espace-societaire',
    loadComponent: () => import('./pages/espace-societaire/espace-societaire').then(m => m.EspaceSocietaireComponent),
    canActivate: [SocietaireGuard]
  },
  {
    path: 'financement',
    loadComponent: () => import('./pages/financement/financement').then(m => m.FinancementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/projects',
    loadComponent: () => import('./pages/admin-projects/admin-projects').then(m => m.AdminProjectsComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/funding',
    loadComponent: () => import('./pages/admin-financements/admin-financements').then(m => m.AdminFinancementsComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./pages/admin-reports/admin-reports').then(m => m.AdminReportsComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/logs',
    loadComponent: () => import('./pages/admin-logs/admin-logs').then(m => m.AdminLogsComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/candidatures',
    loadComponent: () => import('./pages/admin-candidatures/admin-candidatures').then(m => m.AdminCandidaturesComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin-users/admin-users').then(m => m.AdminUsersComponent),
    canActivate: [AdminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
