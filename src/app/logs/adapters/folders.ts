export class Folder {
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
    public nodeType: string;
    public isSelected: boolean;
    public workspaceId?: any;
    constructor(data, workspaceId?) {
      if (data) {
        this.id = data.id;
        this.label = data.name;
        this.data = data.name;
        this.nodeType = data.type;
        this.workspaceId = workspaceId;
        if ((data.type.trim() === 'FOLDER')|| (data.type.trim() === 'WORKSPACE')) {
          this.expandedIcon = 'fa fa-folder-open';
          this.collapsedIcon = 'fa fa-folder';
          this.icon = 'fa fa-folder';
          this.leaf = false;
           this.children = [
          {label: '', data: ''}
          ];
        } else if ((data.type.trim() !== 'FOLDER') || data.type.trim() !== 'WORKSPACE'){
          this.expandedIcon = '';
          this.collapsedIcon = '';
          this.icon = 'fa fa-file-o';
          this.leaf = true;
          this.expanded = false;
          this.isExpand = false;
          this.children = null;
        }
      }
    }
  }
