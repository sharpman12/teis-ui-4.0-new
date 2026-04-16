import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';
import { FlowDataService } from '../../state/flow-data.service';
@Component({
  selector: 'app-flow-table',
  templateUrl: './flow-table.component.html',
  styleUrls: ['./flow-table.component.scss']
})
export class FlowTableComponent implements OnInit {

  constructor(
    private breadcrumb: BreadCrumbService,
    private flowDataService: FlowDataService) {
  }
  route: string;
  @Input() flowDisable: boolean;
  @Input() flowRowIndex: number;
  @Input() flowData: any;
  @Input() visibilityFlowDetailView: boolean;
  @Output() showFlowDetails = new EventEmitter<string>();
  @Output() showFlowData = new EventEmitter<boolean>();
  @Output() showFlowRowNumber = new EventEmitter<number>();
  @Input() currentFlowIndex: number;
  showFlowDetailView = false;
  showFlowDetail: boolean;
  subtitle: any = '';
  collapsed = true;
  showRowTime: any;
  ngOnInit() {
    this.checkTime(this.flowData.value);
  }
  checkTime(fdata) {
    let checkVerify = false; // verify is present or not
    let timeArray: any[] = [];
    const filtered: any[] = [] = fdata.filter(element => element.time !== undefined);
    this.showRowTime = filtered[filtered.length - 1].time;
  }
  toggleFlowtable(flowData, number) {
    this.flowDataService.setSelectedFlowRowNumber(number);
    this.showFlowDetailView = !this.showFlowDetailView;
    this.showFlowData.emit(this.showFlowDetailView);
    this.showFlowDetails.emit(flowData);
    this.showFlowRowNumber.emit(number);
    this.changeTitle();
  }

  changeTitle() {
    this.breadcrumb.setFlowItemDetailView(true);
  }

}
