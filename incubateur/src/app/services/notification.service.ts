import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'celebration';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() { }

  showSuccess(title: string, message: string, duration: number = 5000) {
    this.addNotification('success', title, message, duration);
  }

  showError(title: string, message: string, duration: number = 7000) {
    this.addNotification('error', title, message, duration);
  }

  showInfo(title: string, message: string, duration: number = 4000) {
    this.addNotification('info', title, message, duration);
  }

  showWarning(title: string, message: string, duration: number = 5000) {
    this.addNotification('warning', title, message, duration);
  }

  showCelebration(title: string, message: string, duration: number = 8000) {
    this.addNotification('celebration', title, message, duration);
  }

  private addNotification(type: Notification['type'], title: string, message: string, duration?: number) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    if (duration && duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  removeNotification(id: string) {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  clearAll() {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
