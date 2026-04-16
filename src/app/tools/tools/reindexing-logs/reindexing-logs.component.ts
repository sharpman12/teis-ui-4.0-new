import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToolsService } from '../tools.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';

@Component({
  selector: 'app-reindexing-logs',
  templateUrl: './reindexing-logs.component.html',
  styleUrls: ['./reindexing-logs.component.scss']
})
export class ReindexingLogsComponent implements OnInit, OnDestroy {

  reIndexLogsSub = Subscription.EMPTY; // Subscription to handle re-indexing logs

  constructor(
    private toolsService: ToolsService,
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private messageService: MessageService,
    private webSocketService: WebSocketService,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/tools/export') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
  }

  reIndexLogs(): void {
    this.reIndexLogsSub = this.toolsService.reIndexLogs().subscribe((res) => {
      if (res) {
        this.messageService.add({ key: 'toolsSuccessKey', severity: 'success', summary: '', detail: 'Re-Index logs started successfully!' });
        // Connect web socket after user login to portal
        if (!this.webSocketService?.isWSConnected()) {
          this.webSocketService.connect();
        }
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  ngOnDestroy(): void {
    this.reIndexLogsSub.unsubscribe(); // Unsubscribe to avoid memory leaks
  }

}
