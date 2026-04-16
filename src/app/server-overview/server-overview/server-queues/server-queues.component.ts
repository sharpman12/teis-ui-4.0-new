import { Component, OnInit } from '@angular/core';
import { ServerOverviewService } from '../../server-overview.service';
import { ServerOverviewDataService } from '../../server-overview-data.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-server-queues',
  templateUrl: './server-queues.component.html',
  styleUrls: ['./server-queues.component.scss']
})
export class ServerQueuesComponent implements OnInit {
  currentUser: any;
  allQueues: Array<any> = [];
  isConnectedIntegrationsShow: boolean = false;

  getQueueCountsSub = Subscription.EMPTY;

  constructor(
    private serverOverviewService: ServerOverviewService,
    private serverOverviewDataService: ServerOverviewDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.getQueueCounts();
  }

  /*============ Get Queue Count ============*/
  getQueueCounts() {
    this.allQueues = [];
    this.getQueueCountsSub = this.serverOverviewService.getQueuesCount(this.currentUser?.userName).subscribe(res => {
      for (const [key, value] of Object.entries(res)) {
        this.allQueues.push({
          queueName: key,
          queueGroups: value
        });
      }
      this.allQueues = this.sortQueues(this.allQueues);

      // Remove the first element and store it in a variable
      let firstElement = this.allQueues.shift();

      // Add the first element to the end of the array
      this.allQueues.push(firstElement);

      if (this.allQueues?.length) {
        this.allQueues.forEach(x => {
          if (x?.queueName === 'logWritterQueue') {
            x.queueName = 'Log Writer Queue'
          }
          if (x?.queueName === 'taskTransactionQueue') {
            x.queueName = 'Task Transaction Queue'
          }
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  sortQueues(allQueues: Array<any>) {
    return allQueues.sort((a, b) => {
      var nameA = a.queueName.toUpperCase(); // Convert names to uppercase for case-insensitive comparison
      var nameB = b.queueName.toUpperCase();

      if (nameA < nameB) {
        return -1; // A should come before B
      } else if (nameA > nameB) {
        return 1; // B should come before A
      } else {
        return 0; // Names are equal
      }
    });
  }

  onToggle() {
    this.isConnectedIntegrationsShow = !this.isConnectedIntegrationsShow;
  }
}
