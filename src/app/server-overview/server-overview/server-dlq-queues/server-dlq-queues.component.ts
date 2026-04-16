import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServerOverviewService } from '../../server-overview.service';
import { ServerOverviewDataService } from '../../server-overview-data.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-server-dlq-queues',
  templateUrl: './server-dlq-queues.component.html',
  styleUrls: ['./server-dlq-queues.component.scss']
})
export class ServerDlqQueuesComponent implements OnInit, OnDestroy {
  currentUser: any;
  dlqQueuesCount: any = null;

  getDlqQueueCountsSub = Subscription.EMPTY;

  constructor(
    private serverOverviewService: ServerOverviewService,
    private serverOverviewDataService: ServerOverviewDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {

  }

  getDlqQueuesCounts() {
    this.getDlqQueueCountsSub = this.serverOverviewService.getDLQQueuesCount().subscribe((res) => {
      if (res) {
        res.queueDisplayName = res.queueDisplayName ? res.queueDisplayName : 'DLQ';
        this.dlqQueuesCount = res;
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
    this.getDlqQueueCountsSub.unsubscribe();
  }
}
