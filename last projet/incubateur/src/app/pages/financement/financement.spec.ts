import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FinancementComponent } from './financement';
import { ProjectService } from '../../services/project.service';

describe('FinancementComponent', () => {
  let component: FinancementComponent;
  let fixture: ComponentFixture<FinancementComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const projectSpy = jasmine.createSpyObj('ProjectService', ['getProjects', 'getProjectFinancing']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FinancementComponent, NoopAnimationsModule],
      providers: [
        { provide: ProjectService, useValue: projectSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FinancementComponent);
    component = fixture.componentInstance;
    mockProjectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format currency correctly', () => {
    const amount = 150000;
    const formatted = component.formatCurrency(amount);
    expect(formatted).toContain('150');
    expect(formatted).toContain('€');
  });

  it('should get correct funding type icon', () => {
    expect(component.getFundingTypeIcon('subvention')).toBe('redeem');
    expect(component.getFundingTypeIcon('pret')).toBe('account_balance');
    expect(component.getFundingTypeIcon('investissement')).toBe('trending_up');
    expect(component.getFundingTypeIcon('aide_publique')).toBe('language');
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor('obtenu')).toBe('accent');
    expect(component.getStatusColor('en_cours')).toBe('primary');
    expect(component.getStatusColor('refuse')).toBe('warn');
    expect(component.getStatusColor('en_attente')).toBe('basic');
  });

  it('should navigate to dashboard', () => {
    component.goBackToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to project', () => {
    const projectId = '123';
    component.navigateToProject(projectId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projet', projectId]);
  });
});

