import { TestBed } from '@angular/core/testing';
import { ProjectService, Project } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return active projects', (done) => {
    service.getActiveProjects().subscribe(projects => {
      expect(projects.length).toBeGreaterThan(0);
      expect(projects.every(p => p.status === 'en_cours' || p.status === 'approuve')).toBe(true);
      done();
    });
  });

  it('should return project statistics', () => {
    const stats = service.getProjectStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.totalBudget).toBeGreaterThan(0);
    expect(stats.totalFunding).toBeGreaterThan(0);
  });

  it('should calculate total funding correctly', () => {
    const totalFunding = service.getTotalFundingAllocated();
    expect(totalFunding).toBeGreaterThan(0);
  });

  it('should return projects by status', () => {
    const activeProjects = service.getProjectsByStatus('en_cours');
    expect(activeProjects.every(p => p.status === 'en_cours')).toBe(true);
  });

  it('should return project by id', (done) => {
    service.getProjectById('1').subscribe(project => {
      expect(project).toBeDefined();
      expect(project?.id).toBe('1');
      done();
    });
  });

  it('should return financing by project id', (done) => {
    service.getFinancingByProjectId('1').subscribe(financing => {
      expect(financing).toBeDefined();
      expect(financing?.projectId).toBe('1');
      done();
    });
  });

  it('should add new project', (done) => {
    const newProject = {
      name: 'Test Project',
      description: 'Test Description',
      category: 'Test Category',
      status: 'en_cours' as const,
      startDate: new Date(),
      budget: 100000,
      fundingAllocated: 50000,
      fundingUsed: 0,
      fundingRemaining: 50000,
      milestones: [],
      team: [],
      priority: 'medium' as const,
      progress: 0,
      tags: ['test']
    };

    service.addProject(newProject).subscribe(project => {
      expect(project.name).toBe('Test Project');
      expect(project.id).toBeDefined();
      done();
    });
  });

  it('should update project', (done) => {
    const updates = { progress: 50 };
    
    service.updateProject('1', updates).subscribe(project => {
      expect(project).toBeDefined();
      expect(project?.progress).toBe(50);
      done();
    });
  });

  it('should return funding sources by type', () => {
    const fundingByType = service.getFundingSourcesByType();
    expect(fundingByType.subventions).toBeDefined();
    expect(fundingByType.prets).toBeDefined();
    expect(fundingByType.investissements).toBeDefined();
    expect(fundingByType.aides).toBeDefined();
  });
});
