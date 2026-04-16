import { Injectable } from '@angular/core';
import { FlowGroup, FlowGrpData, FlowModel, FlowModelData, WebFlow, WebFlowData } from './businessmgmt';

@Injectable({
  providedIn: 'root'
})
export class BusinessMgmtDataService {

  /*---------------- Flow Model Properties ----------------*/
  private flowModelData = {
    flowModelId: null,
    flowModels: []
  };

  /*---------------- Flow Group Properties ----------------*/
  private flowGrpData = {
    flowGrpId: null,
    flowGrps: []
  };

  /*---------------- Web Flow Properties ----------------*/
  private webFlowData = {
    webFlowId: null,
    webFlows: []
  };

  constructor() { }

  /*---------------- Flow Models Methods ----------------*/
  storeFlowModels(flowModels: FlowModelData) {
    this.flowModelData = this.flowModelData;
    if (flowModels?.flowModels?.length) {
      flowModels?.flowModels.forEach(item => {
        item.recentlyAdded = false;
        item.recentlyUpdated = false;
      });
    }
    this.flowModelData = flowModels;
  }

  addFlowModel(flowModel: FlowModel) {
    this.actionFlowModel();
    this.flowModelData.flowModelId = flowModel?.id;
    flowModel.recentlyAdded = true;
    flowModel.recentlyUpdated = false;
    this.flowModelData.flowModels.unshift(flowModel);
  }

  updateFlowModel(flowModel: FlowModel) {
    this.actionFlowModel();
    this.flowModelData.flowModelId = flowModel?.id;
    flowModel.recentlyAdded = false;
    flowModel.recentlyUpdated = true;
    const index = this.flowModelData.flowModels.findIndex((el) => el.id === flowModel.id);
    this.flowModelData.flowModels[index] = flowModel;
  }

  storeSelectedFlowModelId(flowModelId: number) {
    this.flowModelData.flowModelId = flowModelId;
  }

  actionFlowModel() {
    if (this.flowModelData.flowModels?.length) {
      this.flowModelData.flowModels.forEach(item => {
        item.recentlyAdded = false;
        item.recentlyUpdated = false;
      });
    }
  }

  removeFlowModel(id: string) {
    if (this.flowModelData) {
      if (Number(this.flowModelData?.flowModelId) === Number(id)) {
        this.flowModelData.flowModelId = null;
      }
      if (this.flowModelData.flowModels?.length) {
        this.flowModelData.flowModels.splice(
          this.flowModelData.flowModels.findIndex(a => a?.id === id), 1
        );
      }
    }
  }

  getFlowModels() {
    return this.flowModelData;
  }

  getActivityModelById(id: string) {
    const uniqueAmIds = [];
    let activityModel;
    const uniqueAm = this.flowModelData?.flowModels.filter(element => {
      const isDuplicate = uniqueAmIds.includes(element.id);
      if (!isDuplicate) {
        uniqueAmIds.push(element.id);
        return true;
      }
      return false;
    });
    if (uniqueAm?.length) {
      activityModel = uniqueAm.find(x => x.id === id);
    }
    return activityModel;
  }

  clearFlowModel() {
    this.flowModelData = {
      flowModelId: null,
      flowModels: []
    };
  }

  // clearActivityModel() {
  //   this.flowModelData = {
  //     flowModelId: null,
  //     flowModels: []
  //   };
  // }

  /*---------------- Flow Groups Methods ----------------*/
  storeFlowGroups(flowGrpData: FlowGrpData) {
    this.flowGrpData = this.flowGrpData;
    if (flowGrpData?.flowGrps?.length) {
      flowGrpData?.flowGrps.forEach(item => {
        item.recentlyAdded = false;
        item.recentlyUpdated = false;
      });
    }
    this.flowGrpData = flowGrpData;
  }

  createFlowGroup(flowGroup: FlowGroup) {
    this.actionFlowGroup();
    this.flowGrpData.flowGrpId = flowGroup?.id;
    flowGroup.recentlyAdded = true;
    flowGroup.recentlyUpdated = false;
    this.flowGrpData?.flowGrps.unshift(flowGroup);
  }

  updateFlowGroup(flowGroup: FlowGroup) {
    this.actionFlowGroup();
    this.flowGrpData.flowGrpId = flowGroup?.id;
    flowGroup.recentlyAdded = false;
    flowGroup.recentlyUpdated = true;
    const index = this.flowGrpData.flowGrps.findIndex((el) => el.id === flowGroup.id);
    this.flowGrpData.flowGrps[index] = flowGroup;
  }

  storeSelectedFlowGrpId(flowGrpId: number) {
    this.flowGrpData.flowGrpId = flowGrpId;
  }

  actionFlowGroup() {
    if (this.flowGrpData?.flowGrps?.length) {
      this.flowGrpData?.flowGrps.forEach(item => {
        item.recentlyAdded = false;
        item.recentlyUpdated = false;
      });
    }
  }

  getFlowGroups() {
    return this.flowGrpData;
  }

  removeFlowGroup(id: string) {
    if (this.flowGrpData) {
      if (Number(this.flowGrpData?.flowGrpId) === Number(id)) {
        this.flowGrpData.flowGrpId = null;
      }
      if (this.flowGrpData?.flowGrps?.length) {
        this.flowGrpData?.flowGrps.splice(
          this.flowGrpData?.flowGrps.findIndex(a => a?.id === id), 1
        );
      }
    }
  }

  getFlowGroupById(id: string) {
    const uniqueFgIds = [];
    let flowGroup;
    const uniqueFg = this.flowGrpData?.flowGrps.filter(element => {
      const isDuplicate = uniqueFgIds.includes(element.id);
      if (!isDuplicate) {
        uniqueFgIds.push(element.id);
        return true;
      }
      return false;
    });
    if (uniqueFg?.length) {
      flowGroup = uniqueFg.find(x => x.id === id);
    }
    return flowGroup;
  }

  clearFlowGrp() {
    this.flowGrpData = {
      flowGrpId: null,
      flowGrps: []
    };
  }
  /*---------------- END Flow Groups Methods ----------------*/

  /*---------------- Web Flow Methods ----------------*/
  storeWebFlows(webFlow: WebFlowData) {
    this.webFlowData = this.webFlowData;
    if (webFlow?.webFlows?.length) {
      webFlow?.webFlows.forEach(item => {
        item.recentlyAdded = false;
        item.recentlyUpdated = false;
      });
    }
    this.webFlowData = webFlow;
  }

  createWebFlow(webFlow: WebFlow) {
    this.actionWebFlow();
    this.webFlowData.webFlowId = webFlow?.id;
    webFlow.recentlyAdded = true;
    webFlow.recentlyUpdated = false;
    this.webFlowData.webFlows.unshift(webFlow);
  }

  updateWebFlow(webFlow: WebFlow) {
    this.actionWebFlow();
    this.webFlowData.webFlowId = webFlow?.id;
    webFlow.recentlyAdded = false;
    webFlow.recentlyUpdated = true;
    const index = this.webFlowData.webFlows.findIndex((el) => el.id === webFlow.id);
    this.webFlowData.webFlows[index] = webFlow;
  }

  storeSelectedWebFlowId(webFlowId: number) {
    this.webFlowData.webFlowId = webFlowId;
  }

  actionWebFlow() {
    if (this.webFlowData.webFlows?.length) {
      this.webFlowData.webFlows.forEach(item => {
        item.recentlyAdded = false;
        item.recentlyUpdated = false;
      });
    }
  }

  removeWebFlow(id: string) {
    if (this.webFlowData) {
      if (Number(this.webFlowData?.webFlowId) === Number(id)) {
        this.webFlowData.webFlowId = null;
      }
      if (this.webFlowData.webFlows?.length) {
        this.webFlowData.webFlows.splice(
          this.webFlowData.webFlows.findIndex(a => a?.id === id), 1
        );
      }
    }
  }

  getWebFlowById(id: string) {
    const uniqueWfIds = [];
    let webFlows;
    const uniqueWf = this.webFlowData?.webFlows.filter(element => {
      const isDuplicate = uniqueWfIds.includes(element.id);
      if (!isDuplicate) {
        uniqueWfIds.push(element.id);
        return true;
      }
      return false;
    });
    if (uniqueWf?.length) {
      webFlows = uniqueWf.find(x => x.id === id);
    }
    return webFlows;
  }

  getWebFlows() {
    return this.webFlowData;
  }

  clearWebFlow() {
    this.webFlowData = {
      webFlowId: null,
      webFlows: []
    };
  }
}