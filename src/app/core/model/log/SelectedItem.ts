
import { TreeNode } from 'primeng/api';
export class SelectedItem {
    constructor( 
          public id: string,
          public name: string,
          public leaf : boolean,
          public type : string, 
          public children: Array<TreeNode>,
          public selected: boolean,
          public partialSelected: boolean 
    ){}     
}




