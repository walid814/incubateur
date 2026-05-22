import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { NavbarComponent } from './navbar';
import { AuthService } from '../../services/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy }
      ]
    }).compileComponents();

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockBreakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;
    
    // Configuration des mocks
    mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockAuthService.getCurrentUser.and.returnValue(null);

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize search query as empty string', () => {
    expect(component.searchQuery).toBe('');
  });

  it('should call console.log when onSearch is called with valid query', () => {
    spyOn(console, 'log');
    component.searchQuery = 'test search';
    
    component.onSearch();
    
    expect(console.log).toHaveBeenCalledWith('Recherche :', 'test search');
  });

  it('should not call console.log when onSearch is called with empty query', () => {
    spyOn(console, 'log');
    component.searchQuery = '';
    
    component.onSearch();
    
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should call authService.isAuthenticated', () => {
    component.isAuthenticated();
    
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });

  it('should call authService.getCurrentUser', () => {
    component.getCurrentUser();
    
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
  });

  it('should call authService.logout and navigate to home on logout', () => {
    component.logout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should observe handset breakpoint', () => {
    expect(mockBreakpointObserver.observe).toHaveBeenCalled();
  });
});
