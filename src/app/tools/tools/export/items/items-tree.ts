import { TreeNode } from "primeng/api";

export class ItemsTree {
    public id: number;
    public label: string;
    public data: string;
    public expandedIcon: string;
    public collapsedIcon: string;
    public icon: string;
    public isConnected: boolean;
    public leaf: boolean;
    public children: Array<any> = [];
    public expanded: boolean;
    public isExpand: boolean;
    public selected: boolean;
    public nodeType: string;
    public temp: Array<any> = [];
    public parent?: TreeNode;
    public partialSelected?: boolean;
    public workspaceId?: number;
    public visible: boolean;

    constructor(data, ws?, expandedItem?) {
        if (data) {
            this.id = data.id;
            this.label = data.name;
            this.data = data.name;
            this.nodeType = data.type;
            this.selected = data.selected;
            this.workspaceId = ws;
            this.isConnected = data.isConnected || false;
            if ((data.type.toUpperCase() === 'FOLDER')) {
                this.expandedIcon = 'fa fa-folder-open';
                this.collapsedIcon = 'fa fa-folder';
                // if (expandedItem === undefined) {
                //     this.expanded = true;
                // } else {
                //     this.expanded = expandedItem;
                // }
                if (data.selected || data.partialSelected) {
                    this.expanded = true;
                    this.visible = true;
                } else {
                    this.expanded = true;
                    this.visible = true;
                }
                this.partialSelected = data.partialSelected;
                if (data.children.length > 0) {
                    for (let count = 0; count <= data.children.length - 1; count++) {
                        this.children.push(new ItemsTree(data.children[count], ws));
                    }
                }
            } else if ((data.type.toUpperCase() !== 'FOLDER')) {
                this.expandedIcon = '';
                this.collapsedIcon = '';
                this.expanded = true;
                this.icon = 'fa fa-file-o';
                this.leaf = true;
                this.expanded = false;
                this.isExpand = false;
                this.children = null;
                this.selected = data.selected;
                this.visible = false;
                // this.partialSelected = data.partialSelected;
                if (data.selected === true) {
                    this.partialSelected = false;
                }
            }
        }
    }
}
