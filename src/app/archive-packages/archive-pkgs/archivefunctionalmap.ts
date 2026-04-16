import { TreeNode } from 'primeng/api';

export class ArchiveFunctionalMap {
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

    constructor(data, ws?, expandedItem?) {
        if (data) {
            this.id = data.id;
            this.label = data.name;
            this.data = data.name;
            this.nodeType = data.type;
            this.isSelected = data.selected;
            this.workspaceId = ws;
            if ((data.type === 'FOLDER') || (data.type === 'WORKSPACE') || (data.type === 'FLOWGROUP')) {
                this.expandedIcon = 'fa fa-folder-open';
                this.collapsedIcon = 'fa fa-folder';
                this.expanded = true;
                this.visible = true;
                // if (expandedItem === undefined) {
                //     this.expanded = true;
                // } else {
                //     this.expanded = expandedItem;
                // }
                // if (data.selected || data.partialSelected) {
                //     this.expanded = true;
                //     this.visible = true;
                // } else {
                //     this.expanded = false;
                //     this.visible = false;
                // }
                this.partialSelected = data.partialSelected;
                if (data?.children?.length > 0) {
                    for (let count = 0; count <= data.children.length - 1; count++) {
                        this.children.push(new ArchiveFunctionalMap(data.children[count], ws));
                    }
                }
            } else if ((data.type !== 'FOLDER') || (data.type !== 'WORKSPACE') || (data.type !== 'FLOWGROUP')) {
                this.expandedIcon = '';
                this.collapsedIcon = '';
                this.expanded = true;
                this.icon = 'fa fa-file-o';
                this.leaf = true;
                this.expanded = false;
                this.isExpand = false;
                this.children = null;
                this.isSelected = data.selected;
                this.visible = false;
                // this.partialSelected = data.partialSelected;
                if (data.selected === true) {
                    this.partialSelected = false;
                }
            }
        }
    }
}
