import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-button class="back-button" (click)="goBack()">
      <mat-icon>arrow_back</mat-icon>
      Retour
    </button>
  `,
  styles: [`
    .back-button {
      color: var(--navy, #01306F);
      font-weight: 600;
      margin-bottom: 12px;
    }
    .back-button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class BackButtonComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
