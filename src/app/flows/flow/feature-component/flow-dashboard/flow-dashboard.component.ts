import { Component, OnInit } from '@angular/core';
import { FlowGroup } from '../../../../core/model/flow/FlowGroup';
import { User } from '../../../../core/model/user';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../../../core/service/header.service';
import { FlowService } from '../../../../core/service/flow.service';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';
import { ProgressiveLoaderService } from '../../../../core/service/progressiveloader.service';
import { of, forkJoin, merge } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { SharedService } from 'src/app/shared/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-flow-dashboard',
  templateUrl: './flow-dashboard.component.html',
  // styleUrls: ['./flow-dashboard.component.scss']
})
export class FlowDashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private pLoader: ProgressiveLoaderService,
    public sharedService: SharedService,
    private flowService: FlowService) {
  }

  currentUser: User;
  cards: FlowGroup[] = [];
  status = false;

  ngOnInit() {
    this.header.show(); // show hide header
    // this.breadcrumb.hide(); // show hide breadcrumb
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/flows') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.visible = false;
    // this.header.show(); // show hide header
    // this.breadcrumb.hide(); // show hide breadcrumb
    // this.breadcrumb.previousHide();
    // this.breadcrumb.previous();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.cards = this.route.snapshot.data.cards || [];
    // this.sequentialApiCall(0);

    // Define this method for get all logs reports card simultaneously
    if (this.cards?.length) {
      this.cards.forEach((x, i, arr) => {
        this.getFlowErrorCounts(x, i);
      });
    }
  }

  clickEvent() {
    this.status = !this.status;
  }

  refreshLogCard(card) {
    this.flowService.refreshFlowById(card.id).subscribe(result => {
      card.errorCount = result.errorCount;
      card.avail = result.avail;
    });
  }


  sequentialApiCall(index): void {
    if (index >= this.cards.length) {
      // Stop
    }
    if (this.cards[index]) {
      this.cards[index].loadCardStatus = true;
      this.flowService.refreshFlowById(this.cards[index].id).subscribe(result => {
        this.cards[index].errorCount = result.errorCount;
        this.cards[index].avail = result.avail;
        this.cards[index].loadCardStatus = false;
        this.sequentialApiCall(index + 1);
      });
    }
  }

  // Define this method for get all flow error counts simultaneously
  getFlowErrorCounts(report: any, index: number = 0) {
    this.cards[index].loadCardStatus = true;
    this.flowService.refreshFlowById(report?.id).subscribe(res => {
      if (res) {
        this.cards[index].errorCount = res.errorCount;
        this.cards[index].avail = res.avail;
        this.cards[index].loadCardStatus = false;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
}
