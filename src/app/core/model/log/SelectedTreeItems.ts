
import { TreeNode } from 'primeng/api';
export class SelectedTreeItems {
    constructor( 
          public id: string,
          public label: string,
          public data: string,
          public expandedIcon: string,
          public collapsedIcon: string,
          public leaf : boolean,
          public type : string, 
          public children: Array<TreeNode>,
          public selected: boolean,
          public icon? : string,
          public expanded?: boolean, 
          public isExpand?: boolean
    ){}     
}




