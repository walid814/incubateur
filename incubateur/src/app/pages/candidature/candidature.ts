import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { CandidatureService } from '../../services/candidature.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-candidature',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule
  ],
  templateUrl: './candidature.html',
  styleUrls: ['./candidature.scss']
})
export class CandidatureComponent {
  informationsPersonnellesForm: FormGroup;
  motivationForm: FormGroup;
  isSubmitting = false; // Protection contre les soumissions multiples
  submitCooldown = false; // Cooldown entre les soumissions
  private readonly COOLDOWN_TIME = 30000; // 30 secondes

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private candidatureService: CandidatureService,
    private notificationService: NotificationService
  ) {
    this.informationsPersonnellesForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.maxLength(100)]],
      lastname: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telephone: ['', [Validators.required, Validators.maxLength(20)]],
      adresse: ['', [Validators.required, Validators.maxLength(255)]],
      ville: ['', [Validators.required, Validators.maxLength(100)]],
      codePostal: ['', [Validators.required, Validators.maxLength(10)]]
    });

    this.motivationForm = this.formBuilder.group({
      motivation: ['', [Validators.required, Validators.minLength(200), Validators.maxLength(255)]],
      objectifs: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(255)]]
    });
  }

  // Méthodes pour vérifier le nombre de caractères et définir les styles
  getMotivationCharacterCount(): number {
    const motivation = this.motivationForm.get('motivation')?.value || '';
    return motivation.length;
  }

  getObjectifsCharacterCount(): number {
    const objectifs = this.motivationForm.get('objectifs')?.value || '';
    return objectifs.length;
  }

  getMotivationFieldClass(): string {
    const count = this.getMotivationCharacterCount();
    const minRequired = 200;
    const maxAllowed = 255;

    if (count >= minRequired && count <= maxAllowed) {
      return 'field-success'; // Couleur verte quand requis atteint
    } else if (count > maxAllowed) {
      return 'field-error'; // Couleur rouge si dépassement
    } else if (count > minRequired * 0.7) {
      return 'field-warning'; // Couleur orange quand proche du requis
    }
    return 'field-default'; // Couleur par défaut
  }

  getObjectifsFieldClass(): string {
    const count = this.getObjectifsCharacterCount();
    const minRequired = 50;
    const maxAllowed = 255;

    if (count >= minRequired && count <= maxAllowed) {
      return 'field-success'; // Couleur verte quand requis atteint
    } else if (count > maxAllowed) {
      return 'field-error'; // Couleur rouge si dépassement
    } else if (count > minRequired * 0.7) {
      return 'field-warning'; // Couleur orange quand proche du requis
    }
    return 'field-default'; // Couleur par défaut
  }

  getCharacterCountMessage(current: number, min: number, max: number): string {
    if (current >= min && current <= max) {
      return `✓ ${current}/${max} caractères - Parfait !`;
    } else if (current > max) {
      return `⚠ ${current}/${max} caractères - Trop long de ${current - max} caractères`;
    } else if (current > min * 0.7) {
      return `⚡ ${current}/${max} caractères - Encore ${min - current} caractères requis`;
    }
    return `📝 ${current}/${max} caractères - Minimum ${min} caractères requis`;
  }

  getProgressPercentage(current: number, min: number, max: number): number {
    if (current <= 0) return 0;
    if (current >= max) return 100;
    
    // Calculer le pourcentage par rapport au minimum requis
    const minProgress = Math.min((current / min) * 60, 60); // 60% quand minimum atteint
    const maxProgress = current > min ? 60 + ((current - min) / (max - min)) * 40 : 0; // 40% supplémentaires jusqu'au max
    
    return Math.min(minProgress + maxProgress, 100);
  }

  getMotivationProgress(): number {
    return this.getProgressPercentage(this.getMotivationCharacterCount(), 200, 255);
  }

  getObjectifsProgress(): number {
    return this.getProgressPercentage(this.getObjectifsCharacterCount(), 50, 255);
  }

  onSubmit() {
    // Vérifier si une soumission est déjà en cours
    if (this.isSubmitting) {
      this.notificationService.showInfo('Patientez', 'Candidature en cours d\'envoi…');
      return;
    }

    // Vérifier le cooldown
    if (this.submitCooldown) {
      this.notificationService.showWarning('Trop rapide', 'Veuillez attendre 30 secondes avant de soumettre à nouveau.');
      return;
    }

    if (this.informationsPersonnellesForm.valid && this.motivationForm.valid) {
      this.isSubmitting = true;
      this.submitCooldown = true;

      const formData = {
        ...this.informationsPersonnellesForm.value,
        ...this.motivationForm.value,
        timestamp: new Date().toISOString(), // Horodatage
        userAgent: navigator.userAgent, // Identification du navigateur
        submissionId: this.generateSubmissionId() // ID unique de soumission
      };

      console.log('Données du formulaire avant envoi:', formData);
      console.log('Formulaire personnel valide:', this.informationsPersonnellesForm.valid);
      console.log('Formulaire motivation valide:', this.motivationForm.valid);

       this.candidatureService.enregistrerCandidature(formData).subscribe({
        next: (response) => {
          console.log('Candidature réussie:', response);
          // La réponse est maintenant du texte plain
          if (typeof response === 'string' && response.includes('Candidature enregistrée avec succès')) {
            this.notificationService.showSuccess(
              '✅ Candidature en cours d\'envoi...', 
              'Vos informations sont en cours de traitement. Redirection vers l\'accueil...',
              3000
            );
          } else {
            this.notificationService.showSuccess(
              '✅ Candidature en cours d\'envoi...', 
              'Vos informations sont en cours de traitement. Redirection vers l\'accueil...',
              3000
            );
          }
          
          // Redirection avec un léger délai pour laisser le temps de voir la notification
          setTimeout(() => {
            this.router.navigate(['/'], { 
              queryParams: { candidature: 'success' }
            });
          }, 2000); // Augmentons légèrement le délai
          
          this.resetSubmissionState();
        },
        error: (error) => {
          console.error('Erreur complète:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          
          // Si c'est un status 200 avec erreur de parsing, c'est en fait un succès
          if (error.status === 200 && error.error && error.error.text && 
              error.error.text.includes('Candidature enregistrée avec succès')) {
            console.log('Candidature réussie malgré l\'erreur de parsing');
            this.notificationService.showSuccess(
              '✅ Candidature en cours d\'envoi...', 
              'Vos informations sont en cours de traitement. Redirection vers l\'accueil...',
              3000
            );
            setTimeout(() => {
              this.router.navigate(['/'], { 
                queryParams: { candidature: 'success' }
              });
            }, 2000);
            this.resetSubmissionState();
            return;
          }
          
          // Gestion des différentes erreurs avec notifications
          if (error.status === 0) {
            this.notificationService.showError(
              'Erreur de connexion',
              'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
            );
          } else if (error.status === 429) {
            this.notificationService.showWarning(
              'Trop de tentatives',
              'Veuillez attendre avant de soumettre une nouvelle candidature.'
            );
          } else if (error.status === 409) {
            this.notificationService.showWarning(
              'Email déjà utilisé',
              'Cette adresse email est déjà associée à une candidature.'
            );
          } else if (error.status === 400) {
            this.notificationService.showError(
              'Données invalides',
              'Vérifiez vos informations et réessayez.'
            );
          } else if (error.status === 500) {
            this.notificationService.showError(
              'Erreur serveur',
              'Une erreur est survenue. Contactez l\'administrateur si le problème persiste.'
            );
          } else {
            this.notificationService.showError(
              'Erreur lors de l\'envoi',
              `Une erreur inattendue s'est produite (${error.status}). Veuillez réessayer.`
            );
          }
          this.resetSubmissionState();
        }
      });

      // Activer le cooldown pendant 30 secondes
      setTimeout(() => {
        this.submitCooldown = false;
      }, this.COOLDOWN_TIME);

    } else {
      this.notificationService.showWarning(
        'Formulaire incomplet',
        'Veuillez compléter tous les champs obligatoires avant de valider.'
      );
    }
  }

  private generateSubmissionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private resetSubmissionState(): void {
    this.isSubmitting = false;
  }
}
