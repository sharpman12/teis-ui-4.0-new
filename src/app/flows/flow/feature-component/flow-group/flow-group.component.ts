import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebFlow } from '../../../../core/model/flow/WebFlow';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '../../../../core/service/header.service';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';
import { FlowService } from '../../../../core/service/flow.service';

import { FlowCriteria } from '../../../../core/model/flow/FlowCriteria';
import { FlowTransaction } from '../../../../core/model/flow/FlowTransaction';

import { FlowCard } from '../../../../core/model/FlowCard';
import { ProgressiveLoaderService } from '../../../../core/service/progressiveloader.service';

import { FlowDataService } from '../../state/flow-data.service';

import { ParseTimeFrame } from '../../../../shared/components/filter/adapter/parseTimeFrame';
import { SharedService } from '../../../../../app/shared/services/shared.service';


@Component({
  selector: 'app-flow-group',
  templateUrl: './flow-group.component.html',
  styleUrls: ['./flow-group.component.scss']
})
export class FlowGroupComponent implements OnInit, OnDestroy {

  constructor(
    private activeroute: ActivatedRoute,
    public header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public flowService: FlowService,
    public flowDataService: FlowDataService,
    public sharedService: SharedService
  ) { }

  public flowGroupListItems = [];
  navbarOpen = false;
  public webFlow: WebFlow[];
  selectedWebFlow: WebFlow;
  transaction: FlowTransaction[] = [];
  flowCard: FlowCard[];
  flowCriteria: FlowCriteria[] = [];
  currentFlowIndex: number = 0;
  storedFlowGroupData;


  ngOnInit() {
    this.header.show(); // show hide header
    this.breadcrumb.previous(); // show hide breadcrumb
    this.breadcrumb.hide();
    this.webFlow = this.activeroute.snapshot.data.webFlow || [];
    let flows = [];
    this.getflowGroupListItems();

    if (this.webFlow.length !== 0) {
      this.loadSideBar(this.activeroute.snapshot.params.id);

      for (let m = 0; m <= this.webFlow.length - 1; m++) {
        const aTimeFrame = new ParseTimeFrame(this.webFlow[m].timeFrame);
        let openTab = {
          id: this.webFlow[m].id,
          timeFrame: this.webFlow[m].timeFrame,
          error: false,
          search: '',
          searchText: '',
          searchType: 'freeText',
          startActivity: false,
          displayString: aTimeFrame.displayString,
          actualTimeFrame: aTimeFrame.displayString,
          clicked: 0,
          errCounter: 0
        };
        flows.push(openTab);
        this.getFlowData(this.webFlow[m], m);

        // Set error count and transaction availaibility for flow status
        this.flowService.getErrorCountByFlow(this.webFlow[m].id).subscribe(result => {
          flows[m].errCounter = result.errorCount;
          flows[m].avail = result.avail;
        });

      }
      this.flowDataService.setFlowGroupData(flows);
      this.changeTitle(this.webFlow[0].name);
      // To set default selection as first element
      this.setFlowData(this.webFlow[0], 0);
      this.flowDataService.flowGroupDataAnnounced$.subscribe(result => {
        this.storedFlowGroupData = result;
      });
    }

    this.sharedService.showMenuBar.subscribe(res => {
      this.navbarOpen = res;
    });
  }

  getflowGroupListItems() {
    this.flowDataService.flowGroupDataAnnounced$.subscribe(
      result => {
        this.flowGroupListItems = result;
      });
  }

  updateFilterData(id, tFrame) {
    this.flowDataService.setFlowId(id);
    this.flowDataService.setTimeFrame(tFrame);
    this.flowDataService.setSearch('');
    this.flowDataService.setError(false);
  }

  loadSideBar(e) {
    this.flowService.getCards()
      .subscribe(
        result => {
          const tempflow = result.filter(x => x.id == e);
          this.flowCard = tempflow;
        });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  changeTitle(title): void {
    this.breadcrumb.setTitle(this.selectedWebFlow.name);
  }

  setFlowData(wFlow: WebFlow, index?): void {
    let oldData = [];
    this.selectedWebFlow = wFlow;
    this.currentFlowIndex = index;
    this.changeTitle(this.selectedWebFlow.name);
    this.breadcrumb.setFlowItemDetailView(false);
    this.updateFilterData(this.selectedWebFlow, wFlow.timeFrame);
    this.flowDataService.flowGroupDataAnnounced$.subscribe(result => {
      oldData = result;
    });

    // Search only on first click
    if (oldData[index].clicked === 0) {
      this.flowService.searchFlow(this.flowCriteria[index])
        .subscribe(
          t => {
            this.transaction[index] = t;
            this.flowDataService.setTransactionTableData(this.transaction);
          });
      oldData[index].clicked++;

      // Set updated timeframe
      const aTF = new ParseTimeFrame(wFlow.timeFrame);
      this.flowGroupListItems[index].actualTimeFrame = aTF.displayString;
    }
    this.flowDataService.setFlowGroupData(oldData)

  }

  getFlowData(wFlow: WebFlow, index?): void {
    this.selectedWebFlow = wFlow;
    this.changeTitle(this.selectedWebFlow.name);
    this.breadcrumb.setFlowItemDetailView(false);

    const aTF = new ParseTimeFrame(wFlow.timeFrame);
    this.flowCriteria.push({
      flowId: wFlow.id,
      error: false,
      timeFrame: wFlow.timeFrame,
      searchText: '',
      startActivity: false,
      pageNo: 1
    });
    this.flowGroupListItems[index] = {
      id: this.flowCriteria[index].flowId,
      timeFrame: this.flowCriteria[index].timeFrame,
      error: this.flowCriteria[index].error,
      search: this.flowCriteria[index].searchText,
      searchText: null,
      searchType: 'freeText',
      startActivity: this.flowCriteria[index].startActivity,
      displayString: aTF.displayString,
      actualTimeFrame: aTF.displayString,
      clicked: 0,
      errCounter: 0
    };
    this.flowDataService.setFlowGroupData(this.flowGroupListItems);
  }

  ngOnDestroy() {
    this.flowDataService.clearFlowGroupData();
    this.breadcrumb.setFlowItemDetailView(false);
  }

}
