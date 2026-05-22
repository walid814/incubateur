import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'en_cours' | 'en_attente' | 'approuve' | 'termine' | 'suspendu';
  startDate: Date;
  endDate?: Date;
  budget: number;
  fundingAllocated: number;
  fundingUsed: number;
  fundingRemaining: number;
  milestones: Milestone[];
  team: TeamMember[];
  priority: 'high' | 'medium' | 'low';
  progress: number; // Pourcentage de completion
  nextDeadline?: Date;
  tags: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  budget: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface FundingSource {
  id: string;
  name: string;
  type: 'subvention' | 'pret' | 'investissement' | 'aide_publique';
  amount: number;
  status: 'obtenu' | 'en_cours' | 'refuse' | 'en_attente';
  applicationDate: Date;
  approvalDate?: Date;
  conditions: string[];
}

export interface ProjectFinancing {
  projectId: string;
  totalBudget: number;
  fundingSources: FundingSource[];
  expenses: Expense[];
  cashFlow: CashFlowEntry[];
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  approved: boolean;
  receipt?: string;
}

export interface CashFlowEntry {
  date: Date;
  type: 'inflow' | 'outflow';
  amount: number;
  description: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private financingSubject = new BehaviorSubject<ProjectFinancing[]>([]);

  // Données de démonstration
  private mockProjects: Project[] = [
    {
      id: '1',
      name: 'EcoTech Solutions',
      description: 'Plateforme de gestion des déchets intelligente utilisant l\'IA pour optimiser les circuits de collecte',
      category: 'Environnement & Tech',
      status: 'en_cours',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-12-15'),
      budget: 250000,
      fundingAllocated: 180000,
      fundingUsed: 75000,
      fundingRemaining: 105000,
      progress: 45,
      priority: 'high',
      nextDeadline: new Date('2025-10-15'),
      tags: ['IA', 'Environnement', 'SaaS'],
      milestones: [
        {
          id: 'm1',
          title: 'Développement MVP',
          description: 'Version bêta de la plateforme',
          dueDate: new Date('2025-06-30'),
          completed: true,
          budget: 50000
        },
        {
          id: 'm2',
          title: 'Tests pilotes',
          description: 'Tests avec 5 municipalités partenaires',
          dueDate: new Date('2025-09-30'),
          completed: false,
          budget: 30000
        },
        {
          id: 'm3',
          title: 'Lancement commercial',
          description: 'Mise sur le marché officielle',
          dueDate: new Date('2025-12-15'),
          completed: false,
          budget: 70000
        }
      ],
      team: [
        { id: 't1', name: 'Sophie Martin', role: 'CEO & Fondatrice', email: 'sophie@ecotech.com' },
        { id: 't2', name: 'Ahmed Benali', role: 'CTO', email: 'ahmed@ecotech.com' },
        { id: 't3', name: 'Lisa Chen', role: 'Designer UX', email: 'lisa@ecotech.com' }
      ]
    },
    {
      id: '2',
      name: 'AgriConnect',
      description: 'Marketplace connectant directement les producteurs locaux aux consommateurs via une app mobile',
      category: 'Agriculture & Commerce',
      status: 'en_cours',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2026-02-28'),
      budget: 150000,
      fundingAllocated: 120000,
      fundingUsed: 35000,
      fundingRemaining: 85000,
      progress: 25,
      priority: 'medium',
      nextDeadline: new Date('2025-11-01'),
      tags: ['Agriculture', 'Mobile', 'E-commerce'],
      milestones: [
        {
          id: 'm4',
          title: 'Étude de marché',
          description: 'Analyse des besoins et concurrence',
          dueDate: new Date('2025-05-31'),
          completed: true,
          budget: 15000
        },
        {
          id: 'm5',
          title: 'Développement app',
          description: 'Application mobile iOS/Android',
          dueDate: new Date('2025-10-31'),
          completed: false,
          budget: 60000
        }
      ],
      team: [
        { id: 't4', name: 'Pierre Dupont', role: 'Fondateur', email: 'pierre@agriconnect.fr' },
        { id: 't5', name: 'Marie Rousseau', role: 'Responsable Marketing', email: 'marie@agriconnect.fr' }
      ]
    },
    {
      id: '3',
      name: 'HealthCare AI',
      description: 'Assistant IA pour le diagnostic médical précoce basé sur l\'analyse d\'images médicales',
      category: 'Santé & IA',
      status: 'approuve',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2027-01-31'),
      budget: 500000,
      fundingAllocated: 400000,
      fundingUsed: 120000,
      fundingRemaining: 280000,
      progress: 30,
      priority: 'high',
      nextDeadline: new Date('2025-12-01'),
      tags: ['IA', 'Santé', 'Deep Learning'],
      milestones: [
        {
          id: 'm6',
          title: 'Collecte données',
          description: 'Constitution de la base de données d\'entraînement',
          dueDate: new Date('2025-08-31'),
          completed: false,
          budget: 100000
        },
        {
          id: 'm7',
          title: 'Modèle IA v1',
          description: 'Premier modèle de reconnaissance',
          dueDate: new Date('2025-12-31'),
          completed: false,
          budget: 150000
        }
      ],
      team: [
        { id: 't6', name: 'Dr. Sarah Johnson', role: 'CEO & Médecin', email: 'sarah@healthai.com' },
        { id: 't7', name: 'David Kim', role: 'Lead AI Engineer', email: 'david@healthai.com' },
        { id: 't8', name: 'Emma Wilson', role: 'Data Scientist', email: 'emma@healthai.com' }
      ]
    },
    {
      id: '4',
      name: 'EduTech VR',
      description: 'Plateforme éducative en réalité virtuelle pour l\'apprentissage immersif des sciences',
      category: 'Éducation & VR',
      status: 'en_attente',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-08-31'),
      budget: 300000,
      fundingAllocated: 0,
      fundingUsed: 0,
      fundingRemaining: 0,
      progress: 5,
      priority: 'medium',
      nextDeadline: new Date('2025-10-31'),
      tags: ['VR', 'Éducation', 'Innovation'],
      milestones: [
        {
          id: 'm8',
          title: 'Prototype VR',
          description: 'Premier prototype de l\'expérience VR',
          dueDate: new Date('2025-12-31'),
          completed: false,
          budget: 80000
        }
      ],
      team: [
        { id: 't9', name: 'Alex Garcia', role: 'Fondateur', email: 'alex@edutechvr.com' },
        { id: 't10', name: 'Océane Moreau', role: 'Designer 3D', email: 'oceane@edutechvr.com' }
      ]
    }
  ];

  private mockFinancing: ProjectFinancing[] = [
    {
      projectId: '1',
      totalBudget: 250000,
      fundingSources: [
        {
          id: 'f1',
          name: 'Subvention BPI France',
          type: 'subvention',
          amount: 100000,
          status: 'obtenu',
          applicationDate: new Date('2024-11-15'),
          approvalDate: new Date('2025-01-10'),
          conditions: ['Reporting trimestriel', 'Justificatifs de dépenses', 'Embauche en France']
        },
        {
          id: 'f2',
          name: 'Fonds Régional Innovation',
          type: 'subvention',
          amount: 50000,
          status: 'obtenu',
          applicationDate: new Date('2024-12-01'),
          approvalDate: new Date('2025-02-15'),
          conditions: ['Implantation régionale', 'Partenariat université']
        },
        {
          id: 'f3',
          name: 'Investisseur Privé - GreenTech Fund',
          type: 'investissement',
          amount: 30000,
          status: 'obtenu',
          applicationDate: new Date('2025-01-20'),
          approvalDate: new Date('2025-02-28'),
          conditions: ['Equity 15%', 'Siège au conseil']
        }
      ],
      expenses: [
        {
          id: 'e1',
          category: 'Développement',
          description: 'Salaires équipe dev (3 mois)',
          amount: 45000,
          date: new Date('2025-03-31'),
          approved: true,
          receipt: 'receipt_001.pdf'
        },
        {
          id: 'e2',
          category: 'Infrastructure',
          description: 'Serveurs cloud AWS',
          amount: 15000,
          date: new Date('2025-06-30'),
          approved: true,
          receipt: 'receipt_002.pdf'
        },
        {
          id: 'e3',
          category: 'Marketing',
          description: 'Campagne de lancement',
          amount: 15000,
          date: new Date('2025-07-15'),
          approved: false
        }
      ],
      cashFlow: [
        { date: new Date('2025-01-15'), type: 'inflow', amount: 100000, description: 'Subvention BPI', category: 'Financement' },
        { date: new Date('2025-02-15'), type: 'inflow', amount: 50000, description: 'Fonds Régional', category: 'Financement' },
        { date: new Date('2025-03-01'), type: 'outflow', amount: 45000, description: 'Salaires dev', category: 'Personnel' },
        { date: new Date('2025-04-15'), type: 'outflow', amount: 15000, description: 'Infrastructure', category: 'Technique' }
      ]
    },
    {
      projectId: '2',
      totalBudget: 150000,
      fundingSources: [
        {
          id: 'f4',
          name: 'Aide Jeune Entrepreneur',
          type: 'aide_publique',
          amount: 25000,
          status: 'obtenu',
          applicationDate: new Date('2025-02-01'),
          approvalDate: new Date('2025-03-15'),
          conditions: ['Moins de 30 ans', 'Premier projet']
        },
        {
          id: 'f5',
          name: 'Prêt Honneur Réseau Entreprendre',
          type: 'pret',
          amount: 50000,
          status: 'obtenu',
          applicationDate: new Date('2025-01-15'),
          approvalDate: new Date('2025-02-28'),
          conditions: ['Taux 0%', 'Remboursement 5 ans', 'Mentorat obligatoire']
        },
        {
          id: 'f6',
          name: 'Crowdfunding Ulule',
          type: 'investissement',
          amount: 45000,
          status: 'en_cours',
          applicationDate: new Date('2025-06-01'),
          conditions: ['Objectif 45K€', 'Contreparties produits']
        }
      ],
      expenses: [
        {
          id: 'e4',
          category: 'Étude',
          description: 'Étude de marché cabinet conseil',
          amount: 12000,
          date: new Date('2025-04-30'),
          approved: true,
          receipt: 'receipt_003.pdf'
        },
        {
          id: 'e5',
          category: 'Développement',
          description: 'Développement app mobile',
          amount: 23000,
          date: new Date('2025-07-31'),
          approved: false
        }
      ],
      cashFlow: [
        { date: new Date('2025-03-15'), type: 'inflow', amount: 25000, description: 'Aide Jeune Entrepreneur', category: 'Financement' },
        { date: new Date('2025-02-28'), type: 'inflow', amount: 50000, description: 'Prêt Honneur', category: 'Financement' },
        { date: new Date('2025-04-30'), type: 'outflow', amount: 12000, description: 'Étude marché', category: 'Conseil' }
      ]
    },
    {
      projectId: '3',
      totalBudget: 500000,
      fundingSources: [
        {
          id: 'f7',
          name: 'Horizon Europe - EIC Accelerator',
          type: 'subvention',
          amount: 200000,
          status: 'obtenu',
          applicationDate: new Date('2024-10-01'),
          approvalDate: new Date('2025-01-15'),
          conditions: ['Projet Deep Tech', 'Partenariats européens', 'Impact social']
        },
        {
          id: 'f8',
          name: 'French Tech Seed',
          type: 'investissement',
          amount: 150000,
          status: 'obtenu',
          applicationDate: new Date('2025-01-01'),
          approvalDate: new Date('2025-02-15'),
          conditions: ['Equity 20%', 'Mentorat 2 ans']
        },
        {
          id: 'f9',
          name: 'Fonds Innovation Santé',
          type: 'subvention',
          amount: 50000,
          status: 'en_cours',
          applicationDate: new Date('2025-05-01'),
          conditions: ['Validation médicale', 'Essais cliniques']
        }
      ],
      expenses: [
        {
          id: 'e6',
          category: 'R&D',
          description: 'Équipement laboratoire IA',
          amount: 80000,
          date: new Date('2025-03-31'),
          approved: true,
          receipt: 'receipt_004.pdf'
        },
        {
          id: 'e7',
          category: 'Personnel',
          description: 'Salaires équipe recherche',
          amount: 40000,
          date: new Date('2025-06-30'),
          approved: true,
          receipt: 'receipt_005.pdf'
        }
      ],
      cashFlow: [
        { date: new Date('2025-01-15'), type: 'inflow', amount: 200000, description: 'Horizon Europe', category: 'Financement' },
        { date: new Date('2025-02-15'), type: 'inflow', amount: 150000, description: 'French Tech Seed', category: 'Financement' },
        { date: new Date('2025-03-31'), type: 'outflow', amount: 80000, description: 'Équipement labo', category: 'Équipement' },
        { date: new Date('2025-06-30'), type: 'outflow', amount: 40000, description: 'Salaires R&D', category: 'Personnel' }
      ]
    }
  ];

  constructor() {
    // Charger les données initiales
    this.projectsSubject.next(this.mockProjects);
    this.financingSubject.next(this.mockFinancing);
  }

  // Observables pour les composants
  getProjects(): Observable<Project[]> {
    return this.projectsSubject.asObservable();
  }

  getProjectFinancing(): Observable<ProjectFinancing[]> {
    return this.financingSubject.asObservable();
  }

  // Méthodes utilitaires
  getActiveProjects(): Observable<Project[]> {
    return of(this.mockProjects.filter(p => p.status === 'en_cours' || p.status === 'approuve'));
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return of(this.mockProjects.find(p => p.id === id));
  }

  getFinancingByProjectId(projectId: string): Observable<ProjectFinancing | undefined> {
    return of(this.mockFinancing.find(f => f.projectId === projectId));
  }

  // Calculs de financements
  getTotalFundingAllocated(): number {
    return this.mockProjects.reduce((total, project) => total + project.fundingAllocated, 0);
  }

  getTotalFundingUsed(): number {
    return this.mockProjects.reduce((total, project) => total + project.fundingUsed, 0);
  }

  getTotalFundingRemaining(): number {
    return this.mockProjects.reduce((total, project) => total + project.fundingRemaining, 0);
  }

  getProjectsByStatus(status: Project['status']): Project[] {
    return this.mockProjects.filter(p => p.status === status);
  }

  // Statistiques
  getProjectStats() {
    return {
      total: this.mockProjects.length,
      active: this.mockProjects.filter(p => p.status === 'en_cours').length,
      approved: this.mockProjects.filter(p => p.status === 'approuve').length,
      pending: this.mockProjects.filter(p => p.status === 'en_attente').length,
      completed: this.mockProjects.filter(p => p.status === 'termine').length,
      totalBudget: this.mockProjects.reduce((sum, p) => sum + p.budget, 0),
      totalFunding: this.getTotalFundingAllocated(),
      totalUsed: this.getTotalFundingUsed()
    };
  }

  getFundingSourcesByType() {
    const allSources = this.mockFinancing.flatMap(f => f.fundingSources);
    return {
      subventions: allSources.filter(s => s.type === 'subvention'),
      prets: allSources.filter(s => s.type === 'pret'),
      investissements: allSources.filter(s => s.type === 'investissement'),
      aides: allSources.filter(s => s.type === 'aide_publique')
    };
  }

  // Méthodes CRUD (simulation)
  addProject(project: Omit<Project, 'id'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: Date.now().toString()
    };
    this.mockProjects.push(newProject);
    this.projectsSubject.next([...this.mockProjects]);
    return of(newProject);
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project | null> {
    const index = this.mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProjects[index] = { ...this.mockProjects[index], ...updates };
      this.projectsSubject.next([...this.mockProjects]);
      return of(this.mockProjects[index]);
    }
    return of(null);
  }

  deleteProject(id: string): Observable<boolean> {
    const index = this.mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProjects.splice(index, 1);
      this.projectsSubject.next([...this.mockProjects]);
      return of(true);
    }
    return of(false);
  }
}
