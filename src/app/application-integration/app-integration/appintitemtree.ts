import { TreeNode } from "primeng/api";

export class Appintitemtree {
    public id: number;
    public label: string;
    public data: string;
    public expandedIcon: string;
    public collapsedIcon: string;
    public icon: string;
    public leaf: boolean;
    public children: Array<any> = [];
    public expanded: boolean;
    public isExpand: boolean;
    public isSelected: boolean;
    public nodeType: string;
    public temp: Array<any> = [];
    public parent?: TreeNode;
    public partialSelected?: boolean;
    public workspaceId?: number;
    public visible: boolean;
    public deployed: boolean;
    public failed?: number;
    public initiate?: number;
    public processing?: number;
    public processingWithError?: number;
    public failedCount?: number;
    public initiateCount?: number;
    public processingCount?: number;
    public processingWithErrorCount?: number;
    public hold?: number;
    public inputHold?: number;
    public belongsToFolder: number;
    public isFailed: boolean;
    public isInitiate: boolean;
    public isProcessing: boolean;
    public isProcessingWithError: boolean;
    public disabled: boolean = false;
    public scheduled: boolean = false;
    public schedulersDisabled: boolean = false;
    public enabled: boolean = false;

    constructor(data, ws?, expandedItem?) {
        if (data) {
            this.id = data?.id;
            this.label = data?.name;
            this.data = data?.name;
            this.nodeType = data?.type;
            this.isSelected = data?.selected;
            this.workspaceId = ws;
            this.deployed = data?.deployed;
            this.belongsToFolder = data?.belongsToFolder;
            this.disabled = data?.disabled;
            this.scheduled = data?.scheduled;
            this.schedulersDisabled = data?.schedulersDisabled ? data?.schedulersDisabled : false;
            this.enabled = data?.enabled;

            if ((data.type === 'FOLDER') || (data.type === 'WORKSPACE')) {
                this.expandedIcon = 'fa fa-folder-open';
                this.collapsedIcon = 'fa fa-folder';
                this.isFailed = data?.folderStatusMap?.Failed;
                this.isInitiate = data?.folderStatusMap?.Initiate;
                this.isProcessing = data?.folderStatusMap?.Processing;
                this.isProcessingWithError = data?.folderStatusMap?.ProcessingWithError;
                this.partialSelected = data.partialSelected;
                this.expanded = false;
                // this.label = `${data.name} (${data.children.length})`;
                if (data.children.length > 0) {
                    for (let count = 0; count <= data.children.length - 1; count++) {
                        this.children.push(new Appintitemtree(data.children[count], ws));
                    }
                }
            } else if ((data.type !== 'FOLDER') || (data.type !== 'WORKSPACE') || (data.type === 'WEBSERVICE')) {
                this.label = data.name + ((data?.deployed || data.type === 'WEBSERVICE') ? '' : '*');
                if (data.children.length > 0) {
                    for (let count = 0; count <= data.children.length - 1; count++) {
                        this.label = data.name + ((data?.deployed || data.type === 'WEBSERVICE') ? '' : '*');
                    }
                }
                this.expandedIcon = '';
                this.collapsedIcon = '';
                this.expanded = false;
                this.failed = data?.statusCountMap?.Failed;
                this.initiate = data?.statusCountMap?.Initiate;
                this.processing = data?.statusCountMap?.Processing;
                this.processingWithError = data?.statusCountMap?.ProcessingWithError;
                this.failedCount = data?.statusCountMap?.Failed;
                this.initiateCount = data?.statusCountMap?.Initiate;
                this.processingCount = data?.statusCountMap?.Processing;
                this.processingWithErrorCount = data?.statusCountMap?.ProcessingWithError;
                this.hold = data?.statusCountMap?.Hold;
                this.inputHold = data?.statusCountMap?.InputHold;
                // this.icon = 'fa fa-file-o';
                this.leaf = true;
                this.isExpand = false;
                this.children = null;
                this.isSelected = data.selected;
                this.visible = false;
                if ((data.type === 'INTEGRATION')) {
                    this.icon = 'fa fa-cogs';
                }
                if ((data.type === 'PROCESS')) {
                    this.icon = 'fa fa-cog';
                }
                if ((data.type === 'TRIGGER')) {
                    this.icon = 'fa fa-bolt';
                }
                if ((data.type === 'WEBSERVICE')) {
                    this.icon = 'fa fa-globe';
                }
                if (data.selected === true) {
                    this.partialSelected = false;
                }
            }
        }
    }
}
