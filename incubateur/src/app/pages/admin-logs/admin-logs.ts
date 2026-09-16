import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardSidebarComponent } from '../dashboard/components/dashboard-sidebar/dashboard-sidebar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

interface LogEntryDto {
  id: number;
  action: string;
  description: string;
  acteur: string;
  cible?: string;
  dateCreation: string;
}

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatChipsModule, MatFormFieldModule, MatSelectModule, FormsModule, DashboardSidebarComponent],
  templateUrl: './admin-logs.html',
  styleUrls: ['./admin-logs.scss']
})
export class AdminLogsComponent implements OnInit {
  logs: LogEntryDto[] = [];
  dataSource = new MatTableDataSource<LogEntryDto>();
  loading = true;
  filtreAction = '';

  displayedColumns = ['action', 'description', 'acteur', 'date'];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<LogEntryDto[]>('/api/logs', { headers }).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.dataSource.data = logs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get actionsDisponibles(): string[] {
    return Array.from(new Set(this.logs.map(l => l.action))).sort();
  }

  appliquerFiltre() {
    this.dataSource.data = this.filtreAction
      ? this.logs.filter(l => l.action === this.filtreAction)
      : this.logs;
  }

  getActionColor(action: string): string {
    if (action.includes('ACCEPTEE') || action.includes('CREE') || action.includes('ENREGISTRE')) return 'success';
    if (action.includes('REFUSE')) return 'warn';
    return 'default';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
