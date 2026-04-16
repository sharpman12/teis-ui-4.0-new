import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ElementRef } from '@angular/core';
import { FlowService } from '../../../../core/service/flow.service';
import { FlowAction } from '../../../../core/model/flow/FlowAction';
import { FlowDataService } from "../../state/flow-data.service";
import { Subscription } from 'rxjs';
import { FlowCriteria } from '../../../../core/model/flow/FlowCriteria';
import { FlowTransaction } from '../../../../core/model/flow/FlowTransaction';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';
import { Activity } from '../../../..//core/model/flow/Activity';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-verify-flow',
  templateUrl: './verify-flow.component.html',
  styleUrls: ['./verify-flow.component.scss']
})
export class VerifyFlowComponent implements OnInit {
  isLoading: boolean = false;
  subscription: Subscription;
  selectedFlowRowNumber: number;
  selectedFlowRow: Activity[];
  constructor(
    private flowService: FlowService,
    private elementRef: ElementRef,
    private flowDataService: FlowDataService,
    private breadcrumbService: BreadCrumbService) {
    this.flowDataService.timeFrameAnnounced$.subscribe(
      result => {
        this.Currenttframe = result
      });
    this.flowDataService.errorAnnounced$.subscribe(
      result => {
        this.CurrentError = result
      });
    this.flowDataService.startActivityAnnounced$.subscribe(
      result => {
        this.CurrentStartActivity = result
      });
    this.flowDataService.searchAnnounced$.subscribe(
      result => {
        this.Currentsearch = result
      });

    this.flowDataService.flowIdAnnounced$.subscribe(
      result => {
        if (result) {
          this.CurrentFlowId = result.id;
        }
      });

    this.flowDataService.selectedFlowRowNumberAnnounced$.subscribe(
      result => {
        this.selectedFlowRowNumber = result;
      });
    this.flowDataService.flowRowDetailViewAnnounced$.subscribe(
      result => {
        this.selectedFlowRow = result;
      });
  }


  @Input() content: any;
  @Input() flowRowIndex: number;
  @Input() currentFlowIndex: number;
  result: string;
  public taskId: string;
  public note: string;
  public action: string;
  public transExecutableId: number;
  public showVerifyContainer: boolean = true;
  Currenttframe;
  Currentsearch;
  CurrentError;
  CurrentFlowId;
  CurrentStartActivity;
  flowCriteria: FlowCriteria;
  transaction: FlowTransaction[] = [];

  ngOnInit() {
    this.getActivityOptionText(
      this.content.activityId,
      this.content.taskId,
      this.content.transExecutableId,
      this.content.name,
      this.content.flow,
    );
    this.flowCriteria = {
      flowId: this.CurrentFlowId,
      error: this.CurrentError,
      timeFrame: this.Currenttframe,
      searchText: this.Currentsearch,
      startActivity: this.CurrentStartActivity
    }
  }

  getActivityOptionText(activityId, taskId, transExecutableId, name, flow) {
    this.isLoading = true;
    this.flowService.getActivityOptionText(activityId, taskId).subscribe(result => {
      this.isLoading = false;
      this.result = result;
      this.openPopUp({ result, taskId, transExecutableId, name });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.isLoading = false;
      } else {
        // handle server side error here
        this.isLoading = false;
      }
    });
  }

  openPopUp($event) {
    this.result = $event.result;
    this.flowService.verifyFlowData(this.content, $event);
    this.show(this.content, $event.taskId, $event.transExecutableId, $event.name, $event);

  }

  onAcceptClick(this) {
    this.flowDataService.timeFrame.subscribe(t => {
      this.tframe = t;
    });

    this.flowService.updateflowAction(new FlowAction(
      this.taskId,
      'Accept',
      this.note,
      this.transExecutableId
    )).subscribe(t => {
      //No need to search again and get activity option text
      // this.getVerifyFlowData();

      //Temporary status update till next server call
      this.content.status = 'Done';
      this.showVerifyContainer = false;
    });
  }

  onDeclineClick(this) {
    this.flowService.updateflowAction(new FlowAction(
      this.taskId,
      'DECLINE',
      this.note,
      this.transExecutableId
    ))
      .subscribe(
        t => {
          //No need to search again and get activity option text
          //this.getVerifyFlowData();

          //Temporary status update till next server call
          this.content.status = 'Failed';
          this.showVerifyContainer = false;

        });
  }

  show(content, taskId: string, transExecutableId: number, name, e) {
    this.content = content;
    this.taskId = taskId;
    this.note = name;
    this.transExecutableId = transExecutableId;


    setTimeout(() => {
      if (this.elementRef.nativeElement.querySelector('#acceptBtn') != null) {
        this.elementRef.nativeElement.querySelector('#acceptBtn')
          .addEventListener('click', this.onAcceptClick.bind(this), false);
      }
    }, 500);

    setTimeout(() => {
      if (this.elementRef.nativeElement.querySelector('#declineBtn') != null) {
        this.elementRef.nativeElement.querySelector('#declineBtn')
          .addEventListener('click', this.onDeclineClick.bind(this), false);
      }
    }, 500);
  }

  getVerifyFlowData() {
    this.flowService.searchFlow(this.flowCriteria)
      .subscribe(
        t => {
          let selectedRow;
          selectedRow = t["transactions"][this.flowRowIndex].activities;
          this.flowDataService.setflowRowDetailView(selectedRow);
          this.flowDataService.flowRowDetailViewAnnounced$.subscribe(
            result => {
              this.selectedFlowRow = result;
            });
          this.flowDataService.transcationTableAnnounced$.subscribe(
            result => {
              this.transaction = result;
            });
          this.transaction[this.currentFlowIndex]["transactions"][this.flowRowIndex].activities = this.selectedFlowRow;
          this.flowDataService.setTransactionTableData(this.transaction);

        });
  }
}
