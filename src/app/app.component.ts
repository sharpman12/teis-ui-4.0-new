import { Component, AfterViewInit, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from '@angular/router';
import { ProgressiveLoaderService } from './core/service/progressiveloader.service';
import { SharedService } from './shared/services/shared.service';
import { AuthService } from './core/service/auth.service';
import { first } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Constants } from './shared/components/constants';
import { MessageService } from 'primeng/api';
import { WebSocketService } from './shared/services/web-socket.service';
import { Subscription } from 'rxjs';
import { SessionService } from './shared/services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'TEIS Web monitor';
  loading;
  value: number = 0;
  isBgColorChanged: boolean;

  getWebSocketResSub = Subscription.EMPTY;

  // Show confirmation dialog when reload the page
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any): void {
  //   // Show confirmation dialog
  //   $event.preventDefault();
  //   $event.returnValue = ''; // Required for Chrome to trigger the popup
  // }

  constructor(
    private router: Router,
    private pLoader: ProgressiveLoaderService,
    public sharedService: SharedService,
    public cd: ChangeDetectorRef,
    private authService: AuthService,
    private messageService: MessageService,
    private webSocketService: WebSocketService,
    private session: SessionService
  ) {
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          // this.pLoader.show();
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          //  this.pLoader.hide();
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  ngOnInit(): void {
    this.session.initIdleTracking();
    this.session.startRefreshTokenWatcher();
    // Check if tab already has an ID in sessionStorage
    let uniqueTabId = sessionStorage.getItem('uniqueTabId');
    const windowName = window.name;

    if (!uniqueTabId) {
      uniqueTabId = this.generateTabId();
      sessionStorage.setItem('uniqueTabId', uniqueTabId);
      window.name = uniqueTabId;
    } else if (!windowName || windowName !== uniqueTabId) {
      uniqueTabId = this.generateTabId();
      sessionStorage.setItem('uniqueTabId', uniqueTabId);
      window.name = uniqueTabId;
    }
  }

  private generateTabId(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const uniqueId = Array.from(array, (num) => chars[num % chars.length]).join('');

    return uniqueId;
  }

  ngAfterViewInit() {
    // tslint:disable-next-line: deprecation
    this.sharedService.isChangeBgColor.subscribe(res => {
      this.isBgColorChanged = res;
      this.cd.detectChanges();
    });
    this.getWebSocketResSub.unsubscribe();
  }

}
