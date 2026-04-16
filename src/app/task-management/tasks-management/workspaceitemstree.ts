import { TreeNode } from 'primeng/api';

export class Workspaceitemstree {
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
    public disabled: boolean = false;

    constructor(data, workspaceId?, expandedItem?) {
        if (data) {
            this.id = data.id;
            this.label = data.name;
            this.data = data.name;
            this.nodeType = data.type;
            this.isSelected = data.selected;
            this.workspaceId = workspaceId;
            this.disabled = data?.disabled;

            if ((data.type === 'FOLDER') || (data.type === 'WORKSPACE') || (data.type === 'FLOWGROUP')) {
                this.expandedIcon = 'fa fa-folder-open';
                this.collapsedIcon = 'fa fa-folder';
                this.partialSelected = data.partialSelected;
                this.expanded = true;
                // this.label = `${data.name} (${data.children.length})`;
                if (data.children.length > 0) {
                    for (let count = 0; count <= data.children.length - 1; count++) {
                        this.children.push(new Workspaceitemstree(data.children[count], workspaceId));
                    }
                }
            } else if ((data.type !== 'FOLDER') || (data.type !== 'WORKSPACE') || (data.type !== 'FLOWGROUP')) {
                this.expandedIcon = '';
                this.collapsedIcon = '';
                this.expanded = true;
                if ((data.type === 'INTEGRATION')) {
                    this.icon = 'fa fa-cogs';
                } else if ((data.type === 'PROCESS')) {
                    this.icon = 'fa fa-cog';
                } else if ((data.type === 'TRIGGER')) {
                    this.icon = 'fa fa-bolt';
                } else if ((data.type === 'WEBSERVICE')) {
                    this.icon = 'fa fa-globe';
                } else {
                    this.icon = 'fa fa-file-o';
                }
                this.leaf = true;
                this.isExpand = false;
                this.children = null;
                this.isSelected = data.selected;
                this.visible = false;
                if (data.selected === true) {
                    this.partialSelected = false;
                }
            }
        }
    }
}
