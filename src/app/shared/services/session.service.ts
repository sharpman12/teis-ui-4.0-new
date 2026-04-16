import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SessionConfirmationComponent } from '../components/session-confirmation/session-confirmation.component';
import { KeycloakSecurityService } from './keycloak-security.service';
import { DashboardDataService } from 'src/app/dashboard/dashboard-data.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private idleTimer!: any;
  private tokenCheckInterval!: any;
  private isConfirmationDialogOpen = false;
  private countdownTimer!: any;
  private countdownSeconds = 60;
  private currentDialogRef: any = null;
  private dialogReason: 'manual' | 'idle' | 'max' | 'token' = 'manual';

  // ⚠️ Must be LESS than KC idle
  private readonly IDLE_WARNING = 29 * 60 * 1000; // 29 min
  private readonly MAX_SESSION_WARNING = 1 * 60; // seconds (1 min)
  private readonly MAX_SESSION_SECONDS = 10 * 60 * 1000; // 10 hours

  constructor(
    private dialog: MatDialog,
    private keycloak: KeycloakSecurityService,
    private dashboardDataService: DashboardDataService,
  ) { }

  /** Track activity */
  initIdleTracking() {
    ['click', 'mousemove', 'keydown', 'scroll'].forEach(event =>
      window.addEventListener(event, () => this.resetIdleTimer())
    );
    this.resetIdleTimer();
  }

  /** Open confirmation popup */
  openLogoutConfirm(reason: 'manual' | 'idle' | 'max' | 'token') {
    console.log('Opening logout confirmation for reason:', reason);
    if (reason === 'max') {
      this.closedSession();
      this.logout();
      return;
    }
    // Prevent opening multiple dialogs
    if (this.isConfirmationDialogOpen) {
      // If token expires while manual logout dialog is open, update it
      if (reason === 'token' && this.dialogReason === 'manual' && this.currentDialogRef) {
        this.updateDialogForTokenExpiry();
      }
      return;
    }

    this.isConfirmationDialogOpen = true;
    this.countdownSeconds = 60;
    this.dialogReason = reason;

    // Implementation to open confirmation dialog
    const dialogRef = this.dialog.open(SessionConfirmationComponent, {
      width: "600px",
      // maxHeight: '95vh',
      // height: '95%',
      disableClose: true, // Prevent closing by clicking outside
      data: {
        reason: reason,
        message: reason === 'manual' ? 'Are you sure you want to logout?' :
          reason === 'idle' ? 'Your session has been idle for some time. Would you like to remain signed in to continue?' :
            'Your session is about to expire. Do you want to extend your session?',
        confirmButtonText: reason === 'manual' ? 'Ok' : 'Yes',
        cancelButtonText: reason === 'manual' ? 'Cancel' : 'Logout',
        showCountdown: true, // Show countdown for all reasons
        countdown: this.countdownSeconds,
        showCountdownOnConfirm: reason === 'manual' // Show countdown on confirm button for manual
      },
    });

    // Store dialog reference for potential updates
    this.currentDialogRef = dialogRef;

    // Start countdown timer for all reasons
    this.startCountdownTimer(dialogRef);

    dialogRef.afterClosed().subscribe(result => {
      this.isConfirmationDialogOpen = false; // Reset flag when dialog closes
      this.stopCountdownTimer(); // Stop countdown when dialog closes
      this.currentDialogRef = null; // Clear dialog reference

      if (result?.confirmed) {
        if (result?.reason === 'manual' || this.dialogReason === 'manual') {
          this.closedSession();
          this.logout();
        } else {
          this.continueSession();
        }
      } else {
        if (result?.reason === 'manual' || this.dialogReason === 'manual') {
          this.continueSession();
        } else {
          this.closedSession();
          this.logout();
        }
      }
    });
  }

  /** Start countdown timer */
  private startCountdownTimer(dialogRef: any) {
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;

      // Update dialog component with countdown value
      if (dialogRef.componentInstance) {
        dialogRef.componentInstance.countdown = this.countdownSeconds;
        // Trigger change detection for OnPush strategy
        if (dialogRef.componentInstance.detectChanges) {
          dialogRef.componentInstance.detectChanges();
        }
      }

      // Auto logout when countdown reaches 0
      if (this.countdownSeconds <= 0) {
        this.stopCountdownTimer();
        dialogRef.close({ autoLogout: true });
        this.closedSession();
        this.logout();
      }
    }, 1000); // Update every second
  }

  /** Stop countdown timer */
  private stopCountdownTimer() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  /** Update dialog when token expires during manual logout */
  private updateDialogForTokenExpiry() {
    if (!this.currentDialogRef || !this.currentDialogRef.componentInstance) {
      return;
    }

    this.dialogReason = 'token';
    this.countdownSeconds = 60;

    // Update the dialog data
    this.currentDialogRef.componentInstance.dialogData = {
      ...this.currentDialogRef.componentInstance.dialogData,
      reason: 'token',
      message: 'Your session is about to expire. Do you want to extend your session?',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Logout',
      showCountdown: true,
      countdown: this.countdownSeconds
    };

    // Start countdown timer if not already running
    if (!this.countdownTimer) {
      this.startCountdownTimer(this.currentDialogRef);
    }
  }

  /** Continue session */
  private async continueSession() {
    try {
      await this.keycloak.updateToken();
      // this.resetTimers();
    } catch (error) {
      console.error('Token refresh failed');
      this.logout();
    }
  }

  /** Logout */
  logout() {
    this.keycloak.logout();
  }

  /** Reset idle timer on activity */
  private resetIdleTimer() {
    clearTimeout(this.idleTimer);

    this.idleTimer = setTimeout(() => {
      this.openLogoutConfirm('idle');
    }, this.IDLE_WARNING);
  }

  /** Start refresh token watcher */
  startRefreshTokenWatcher(): void {
    this.tokenCheckInterval = setInterval(() => {
      this.checkSessionState();
    }, 30 * 1000); // every 30 sec
  }

  /** Check refresh token expiry */
  private checkSessionState(): void {
    if (this.isConfirmationDialogOpen) return;

    const rt = this.keycloak?.getParsedRefreshToken();
    const idToken = this.keycloak.getAuthenticatedTime();

    if (!idToken) {
      this.logout();
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionAge = now - idToken.auth_time;
    const remaining = this.MAX_SESSION_SECONDS - sessionAge;

    /* Token expiring */
    // if (this.keycloak.isTokenExpiring(60)) {
    //   this.openLogoutConfirm('token');
    //   return;
    // }

    // 🔴 Max session ended
    if (remaining <= 0) {
      this.logout();
      return;
    }

    // 🔴 Max session near end
    if (remaining < this.MAX_SESSION_WARNING) {
      this.openLogoutConfirm('max');
    }
  }

  /** 🔒 Clear session data on logout */
  closedSession(): void {
    clearTimeout(this.idleTimer);
    clearInterval(this.tokenCheckInterval);
    localStorage.clear();
    sessionStorage.clear();
    this.dashboardDataService.clearAllWorkspaces();
    this.dashboardDataService.clearLogCardFailedCount();
    this.dashboardDataService.clearFlowCardFailedCount();
  }
}
