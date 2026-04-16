import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { HeaderService } from '../../core/service/header.service';
import { SharedService } from '../../shared/services/shared.service';
import { ArchiveFlowService } from './archive-flow.service';

@Component({
  selector: 'app-archive-flow',
  templateUrl: './archive-flow.component.html',
  styleUrls: ['./archive-flow.component.scss']
})
export class ArchiveFlowComponent implements OnInit {

  cards = [
    // { id: 1, name: 'Now - 5 Minutes', description: 'Search logs from now to last five minutes' },
    // { id: 2, name: 'Now - 5 Minutes', description: 'Search logs from now to last five minutes' },
    // { id: 3, name: 'Now - 5 Minutes', description: 'Search logs from now to last five minutes' },
    // { id: 4, name: 'Now - 5 Minutes', description: 'Search logs from now to last five minutes' },
  ];

  constructor(
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private router: Router,
    private archiveFlowService: ArchiveFlowService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/archive_packages_flow') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.sharedService.isChangeBgColor.next(true);
    this.getArchiveFlowGroups();
  }

  selectedCard(cardId: number) {
    this.router.navigate(['/archive_packages_flow', cardId]);
  }

  /*========= Get Archive Flow Groups ==========*/
  getArchiveFlowGroups() {
    this.archiveFlowService.getArchiveFlowGroups().subscribe(res => {
      this.cards = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archiveFlowInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

}
