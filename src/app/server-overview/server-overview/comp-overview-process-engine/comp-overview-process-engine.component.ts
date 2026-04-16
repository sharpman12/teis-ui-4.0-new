import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { take } from 'rxjs/operators';
import Annotation from 'chartjs-plugin-annotation';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { ServerOverviewService } from '../../server-overview.service';
import { ServerOverviewDataService } from '../../server-overview-data.service';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-comp-overview-process-engine',
  templateUrl: './comp-overview-process-engine.component.html',
  styleUrls: ['./comp-overview-process-engine.component.scss']
})
export class CompOverviewProcessEngineComponent implements OnInit, OnDestroy {
  timeFrameForm: UntypedFormGroup;
  workspaces: Array<Workspace> = [];
  selectedWorkspaceId: number = 1;
  selectedTimeFrame: string = '';
  currentUser: any;
  fromDate: string = '';
  toDate: string = '';
  isDateRangeShow = false;
  isErrMsgShow = false;
  today = new Date();
  timeHolder: Array<any> = [];
  scriptEngineGroups: Array<any> = [];
  isShowWorkspacesList: boolean = false;
  selectedScriptEngineGrp = null;
  peOptions = [
    { id: 1, value: 'SE group load summary' },
    { id: 2, value: 'Workspace load summary' }
  ];
  timeFrameList = [
    { id: 'last1Hour', value: 'Now - 1 Hour (in minute)' },
    { id: 'last24Hours', value: 'Now - 24 Hours (in hour)' },
    { id: 'yesterday', value: 'Yesterday (in hour)' },
    // { id: 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss', value: 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss' },
  ];
  allWsOption = [
    {
      archived: false,
      defaultWorkspace: false,
      deleted: false,
      deployLogId: '',
      deployedItems: null,
      description: '',
      id: '0',
      items: null,
      lastUpdated: null,
      lockedItems: null,
      name: 'All Workspaces',
      notInitializeItems: null,
      schedulerDisabled: false,
      status: null,
      unDeployLogId: null,
      unDeployedItems: null,
      updatedBy: null,
      userIds: null,
      webServiceDisabled: false,
    }
  ];

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: [],
  };

  public lineChartType: ChartType = 'line';

  getWorkspacesSub = Subscription.EMPTY;
  getProcessEngineSub = Subscription.EMPTY;
  getAllWorkspacesPESub = Subscription.EMPTY;
  getScriptEngineGroupSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private fb: UntypedFormBuilder,
    private serverOverviewService: ServerOverviewService,
    private serverOverviewDataService: ServerOverviewDataService
  ) {
    Chart.register(Annotation);
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.createForm();
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/processingOverview/server') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.sharedService.isChangeBgColor.next(true);
    this.getScriptEngineGroups();
    this.changeTimeframe('last1Hour');
  }

  createForm() {
    this.timeFrameForm = this.fb.group({
      peOption: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngineGrp: [{ value: '1', disabled: false }, {
        validators: [Validators.required]
      }],
      workspace: [{ value: '1', disabled: false }, {
        validators: [Validators.required]
      }],
      timeFrame: [{ value: 'last1Hour', disabled: false }, {
        validators: [Validators.required]
      }],
      fromDate: [{ value: '', disabled: false }, {
        validators: []
      }],
      toDate: [{ value: '', disabled: true }, {
        validators: []
      }],
    });
  }

  refreshPE() {
    this.lineChartData = {
      datasets: [],
      labels: [],
    };
  }

  refreshScriptEngineGrp() {
    this.serverOverviewDataService.clearSEGroups();
    this.getScriptEngineGroups();
  }

  refreshWorkspaceList() {
    this.serverOverviewDataService.clearWorkspaces();
    this.getWorkspacesByUser();
  }

  refreshTimeFrame() {
    const formValue = this.timeFrameForm.getRawValue();
    this.changeTimeframe(formValue?.timeFrame);
    this.search();
  }

  getOptionColor(option: string): string {
    // Your conditional logic to determine background color based on option value
    if (Number(option) === 0) {
      return '#FAE2E2';
    } else {
      return '';
    }
  }

  getTblCountStyle(count: number) {
    if (Number(count) > 0) {
      return 'bold';
    } else {
      return '';
    }
  }

  /*============ Get Workspaces By Username ============*/
  getWorkspacesByUser() {
    const workspaces = this.serverOverviewDataService.getWorkspaces();
    if (workspaces?.length) {
      this.getValidateWorkspaces(JSON.parse(JSON.stringify(workspaces)));
      // this.workspaces = this.sortWorkspaces(workspaces, 'name');
      // const allWs = [...this.workspaces, ...this.allWsOption];
      // this.workspaces = this.removeDuplicates(allWs, 'id');
      // this.onChangeWorkspace(Number(this.workspaces[0]?.id));
    } else {
      this.getWorkspaces();
    }
  }

  getWorkspaces() {
    this.lineChartData = {
      datasets: [],
      labels: [],
    };
    this.getWorkspacesSub = this.serverOverviewService.getWorkspacesByUsername(this.currentUser?.userName).subscribe((res) => {
      this.getValidateWorkspaces(JSON.parse(JSON.stringify(res)));
      // this.workspaces = this.sortWorkspaces(res, 'name');
      // this.serverOverviewDataService.storeWorkspaces(this.workspaces);
      // const allWs = [...this.workspaces, ...this.allWsOption];
      // this.workspaces = this.removeDuplicates(allWs, 'id');
      // this.onChangeWorkspace(Number(this.workspaces[0]?.id));
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // Validate workspaces as per login user access
  getValidateWorkspaces(workspaces: Array<any>) {
    let defaultWS = null;
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;

    if (workspaces?.length && accessWorkspaces?.length) {
      // Filter out archived workspaces
      const workspacesArr = JSON.parse(JSON.stringify(workspaces)).filter((x) => !x?.archived);
      accessWorkspaces.forEach((aws) => {
        workspacesArr.forEach((ws) => {
          if (Number(aws?.workspaceId) === Number(ws?.id)) {
            if (aws?.accessList.some((x) => x?.key === 'PO_PE')) {
              accessWorkspacesArr.push(ws);
            }
          }
        });
      });

      const sortWorkspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

      let ws = [];
      if (!this.currentUser?.superAdminUser) {
        ws = sortWorkspaces.filter((item) => Number(item?.id) !== 1);
      } else {
        ws = sortWorkspaces;
      }

      const allWs = [...ws, ...this.allWsOption];
      this.workspaces = this.removeDuplicates(allWs, 'id');

      if (this.workspaces?.length) {
        defaultWS = this.workspaces.find((x) => x?.defaultWorkspace);
        if (defaultWS) {
          this.onChangeWorkspace(Number(defaultWS?.id));
        } else {
          this.onChangeWorkspace(Number(this.workspaces[0]?.id));
        }

        this.serverOverviewDataService.storeWorkspaces(this.workspaces);
      }
    }
  }

  getScriptEngineGroups() {
    const scriptEngineGrp = this.serverOverviewDataService.getSEGroups();
    if (scriptEngineGrp?.length) {
      this.scriptEngineGroups = this.sortWorkspaces(scriptEngineGrp, 'groupName');
      this.onChangeSEGrp(this.scriptEngineGroups[0]?.id);
    } else {
      this.getScriptEngineGroupSub = this.serverOverviewService.getSEGroups().subscribe((res) => {
        if (res?.length) {
          this.scriptEngineGroups = this.sortWorkspaces(res, 'groupName');
          this.serverOverviewDataService.storeScriptEngineGroups(this.scriptEngineGroups);
          this.onChangeSEGrp(this.scriptEngineGroups[0]?.id);
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

  /*=========== Sort Workspace ===========*/
  sortWorkspaces(workspaces: Array<any>, property: string) {
    return workspaces.sort((a, b) => {
      var nameA = a[property].toUpperCase(); // Convert names to uppercase for case-insensitive comparison
      var nameB = b[property].toUpperCase();

      if (nameA < nameB) {
        return -1; // A should come before B
      } else if (nameA > nameB) {
        return 1; // B should come before A
      } else {
        return 0; // Names are equal
      }
    });
  }

  /*=========== Remove Duplicate Workspace ===========*/
  removeDuplicates(array, property) {
    return array.filter((obj, index, self) =>
      index === self.findIndex((o) => (
        o[property] === obj[property]
      ))
    );
  }

  /*=========== On Change PE Option ===========*/
  onChangeSEOption(id: number) {
    this.lineChartData = {
      datasets: [],
      labels: [],
    };
    if (Number(id) === 1) {
      this.isShowWorkspacesList = false;
      this.getScriptEngineGroups();
    } else {
      this.isShowWorkspacesList = true;
      this.getWorkspacesByUser();
    }
  }

  onChangeSEGrp(segId: number) {
    this.lineChartData = {
      datasets: [],
      labels: [],
    };
    this.selectedScriptEngineGrp = null;
    if (this.scriptEngineGroups?.length) {
      this.scriptEngineGroups.forEach(x => {
        if (Number(x?.id) === Number(segId)) {
          this.selectedScriptEngineGrp = x;
          this.timeFrameForm.get('scriptEngineGrp').patchValue(this.selectedScriptEngineGrp?.id);
        }
      });
    }
  }

  /*=========== On Change Workspace ===========*/
  onChangeWorkspace(workspaceId: number) {
    this.lineChartData = {
      datasets: [],
      labels: [],
    };
    this.workspaces.forEach((w) => {
      if (Number(w?.id) === Number(workspaceId)) {
        this.selectedWorkspaceId = Number(w?.id);
        this.timeFrameForm.get('workspace').patchValue(this.selectedWorkspaceId);
      }
    });
  }

  /*========= Change Timeframe =========*/
  changeTimeframe(timeFrame: string) {
    this.lineChartData = {
      datasets: [],
      labels: [],
    };
    this.selectedTimeFrame = '';
    this.fromDate = '';
    this.toDate = '';
    this.timeFrameForm.get('fromDate').clearValidators();
    this.timeFrameForm.get('toDate').clearValidators();
    this.timeFrameForm.get('fromDate').updateValueAndValidity();
    this.timeFrameForm.get('toDate').updateValueAndValidity();
    if (timeFrame === 'last1Hour') {
      this.isDateRangeShow = false;
      const now = new Date();
      const last1hours = new Date();
      last1hours.setHours(last1hours.getHours() - 1);
      const last_1Hours = `${this.getDateFormat(last1hours)} to ${this.getDateFormat(now)}`;
      this.fromDate = this.getDateFormat(last1hours);
      this.toDate = this.getDateFormat(now);
      this.selectedTimeFrame = last_1Hours;
    }
    if (timeFrame === 'last24Hours') {
      this.isDateRangeShow = false;
      // const now = new Date();
      // const last24hours = new Date();
      // last24hours.setHours(last24hours.getHours() - 24);
      // const last_24Hours = `${this.getDateFormat(last24hours)} to ${this.getDateFormat(now)}`;

      const dt = new Date();
      const now = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0);
      const last24hours = new Date();
      last24hours.setHours(last24hours.getHours() - 24, 0, 0);
      const last_24Hours = `${this.getDateFormat(last24hours)} to ${this.getDateFormat(now)}`;

      this.fromDate = this.getDateFormat(last24hours);
      this.toDate = this.getDateFormat(now);
      this.selectedTimeFrame = last_24Hours;
    }
    if (timeFrame === 'yesterday') {
      this.isDateRangeShow = false;
      const dt = new Date();
      const now = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 0, 0, 0);
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const now_yesterday = `${this.getDateFormat(now)} to ${this.getDateFormat(yesterday)}`;
      this.fromDate = this.getDateFormat(now);
      this.toDate = this.getDateFormat(yesterday);
      this.selectedTimeFrame = now_yesterday;
    }
    if (timeFrame === 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss') {
      this.isDateRangeShow = true;
      let fromDate = '';
      let toDate = '';
      this.timeFrameForm.get('fromDate').addValidators([Validators.required]);
      this.timeFrameForm.get('toDate').addValidators([Validators.required]);
      this.timeFrameForm.get('fromDate').updateValueAndValidity();
      this.timeFrameForm.get('toDate').updateValueAndValidity();
      this.timeFrameForm.get('fromDate').reset();
      this.timeFrameForm.get('toDate').reset();
      this.timeFrameForm.get('toDate').disable();
      this.timeFrameForm.get('fromDate').valueChanges.pipe(take(1)).subscribe(startDate => {
        fromDate = startDate;
        if (startDate) {
          this.isErrMsgShow = true;
          this.timeFrameForm.get('toDate').enable();
          this.timeFrameForm.get('toDate').valueChanges.pipe(take(1)).subscribe(endDate => {
            toDate = endDate;
            if (toDate) {
              this.isErrMsgShow = false;
            }
            if (fromDate && toDate) {
              const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
              this.fromDate = this.getDateFormat(fromDate);
              this.toDate = this.getDateFormat(toDate);
              this.selectedTimeFrame = custom_date;
            }
          });
        }
      });
    }
  }

  getDateFormat(date: any): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  search() {
    const formValue = this.timeFrameForm.getRawValue();
    const processEngineDto = {
      workspaceId: formValue?.workspace,
      fromDate: this.fromDate,
      toDate: this.toDate,
      requestFormat: formValue?.timeFrame === 'last1Hour' ? 'M' : 'H',
      itemIds: [],
      scriptEngineName: '',
      filterName: (Number(formValue?.peOption) === 1 ? 'SCRIPT_ENGINE_GROUP' : 'WORKSPACE'),
      scriptEngGroupId: (Number(formValue?.peOption) === 1 ? formValue?.scriptEngineGrp : 'ThisIsDummyValue')
    };
    this.getProcessEngineSub = this.serverOverviewService.getPEDetails(processEngineDto).subscribe(res => {
      let minHrArr = [];
      let dataObj = null;
      let dataObjeArr = [];

      if (formValue?.timeFrame === 'last1Hour') {
        minHrArr = this.getLast1Hr();
      } else if (formValue?.timeFrame === 'last24Hours') {
        minHrArr = this.getLast24Hours();
      } else {
        minHrArr = this.getYesterday();
      }

      if (res?.length) {
        res.forEach(x => {
          let newData = [];
          newData = [...this.timeHolder];
          if (x?.timeAndCounts?.length && minHrArr?.length) {
            x?.timeAndCounts.forEach(tc => {
              minHrArr.forEach((t, i, tArr) => {
                if (tc?.hrMin === t) {
                  const index = tArr.indexOf(t);
                  newData[index] = tc?.count;
                }
              });
            });
          }
          dataObj = {
            data: newData,
            // label: `${x?.scriptEngGroupName}`
            label: (Number(formValue?.peOption) === 1 ? `${x?.workspaceName}` : `${x?.scriptEngGroupName}`)
          };
          dataObjeArr.push(dataObj);
        });
      }

      this.lineChartData = {
        datasets: dataObjeArr,
        labels: minHrArr,
      };
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  searchAllWsPE() {
    const formValue = this.timeFrameForm.getRawValue();
    const allWorkspacesIds = this.workspaces.map(x => x?.id);
    const allWsIds = allWorkspacesIds.filter((id: any) => Number(id) !== 0);
    const processEngineDto = {
      workspaceId: null,
      fromDate: this.fromDate,
      toDate: this.toDate,
      requestFormat: formValue?.timeFrame === 'last1Hour' ? 'M' : 'H',
      itemIds: [],
      scriptEngineName: '',
      workspaceIds: allWsIds?.length ? allWsIds : []
    };
    this.getAllWorkspacesPESub = this.serverOverviewService.getAllWorkspacesPEDetails(processEngineDto).subscribe(res => {
      let minHrArr = [];
      let dataObj = null;
      let dataObjeArr = [];

      if (formValue?.timeFrame === 'last1Hour') {
        minHrArr = this.getLast1Hr();
      } else if (formValue?.timeFrame === 'last24Hours') {
        minHrArr = this.getLast24Hours();
      } else {
        minHrArr = this.getYesterday();
      }

      if (res?.length) {
        res.forEach(x => {
          let newData = [];
          newData = [...this.timeHolder];
          if (x?.timeAndCounts?.length && minHrArr?.length) {
            x?.timeAndCounts.forEach(tc => {
              minHrArr.forEach((t, i, tArr) => {
                if (tc?.hrMin === t) {
                  const index = tArr.indexOf(t);
                  newData[index] = tc?.count;
                }
              });
            });
          }
          dataObj = {
            data: newData,
            label: `${x?.scriptEngGroupName}`
          };
          dataObjeArr.push(dataObj);
        });
      }

      this.lineChartData = {
        datasets: dataObjeArr,
        labels: minHrArr,
      };
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getLast1Hr() {
    this.timeHolder = [];
    // const now = new Date(); // Get current date and time
    // const lastHour = new Date(now.getTime() - (60 * 60 * 1000)); // Subtract an hour

    const now = new Date(this.toDate); // Get current date and time
    const lastHour = new Date(now.getTime() - (60 * 60 * 1000)); // Subtract an hour

    const hoursAndMinutesArray = [];

    // Iterate through each minute of the last hour
    for (let i = 0; i <= 60; i++) {
      this.timeHolder.push(0);
      const time = new Date(lastHour.getTime() + (i * 60 * 1000)); // Increment by a minute
      const hour = time.getHours();
      const minute = time.getMinutes();

      hoursAndMinutesArray.push(`${this.addLeadingZero(hour)}:${this.addLeadingZero(minute)}`);
    }

    return hoursAndMinutesArray;
  }

  getLast24Hours() {
    this.timeHolder = [];
    let hoursArray = [];

    // Get current date and time
    // let currentDate = new Date();
    let currentDate = new Date(this.toDate);

    // Loop through the last 24 hours
    for (let i = 0; i <= 24; i++) {
      this.timeHolder.push(0);
      // Calculate the time for each hour
      let hour = currentDate.getHours() - i;
      // let minutes = currentDate.getMinutes();
      let minutes = '0';

      // If hour goes below 0, wrap around to 23
      if (hour < 0) {
        hour += 24;
      }

      // Format hours and minutes with leading zeros if needed
      let formattedHour = ('0' + hour).slice(-2);
      let formattedMinutes = ('0' + minutes).slice(-2);

      // Add hour and minutes to the array
      hoursArray.unshift(formattedHour + ':' + formattedMinutes);
    }
    return hoursArray;
  }

  getYesterday() {
    this.timeHolder = [];
    // Get yesterday's date
    // const yesterday = new Date();
    const yesterday = new Date(this.toDate);
    yesterday.setDate(yesterday.getDate() - 1);

    // Initialize an array to hold the hours and minutes
    const hoursAndMinutesArray = [];

    // Loop through the 24 hours of yesterday
    for (let i = 0; i < 24; i++) {
      this.timeHolder.push(0);
      // Format hour and minute strings
      const hour = String(i).padStart(2, '0'); // Ensure 2-digit hour format
      const minute = '00'; // We're considering only 00 minutes

      // Construct the time string (HH:MM format)
      const timeString = `${hour}:${minute}`;

      // Add the time string to the array
      hoursAndMinutesArray.push(timeString);
    }
    this.timeHolder.push(0);
    hoursAndMinutesArray.push(`23:59`);
    return hoursAndMinutesArray;
  }

  addLeadingZero(num: number) {
    return Number(num) < 10 ? `0${num}` : `${num}`;
  }

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.getProcessEngineSub.unsubscribe();
  }
}
