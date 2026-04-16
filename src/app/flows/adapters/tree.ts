import { TreeNode } from 'primeng/api';
export class Tree  {
    files: TreeNode[];
    data
    constructor(item) {
        this.data = item;
        this.generateTreeTable(this.data);
    }


 makeNode(data: any) {
    const obj = {};
    obj["data"] = {...data};
    return obj;
  }
  
  processNode(carData: any) {
    const carDataLength = carData.length;
    let i = 1, currentLevel = 0;
    let rootNode = this.makeNode(carData[0]);
    let currentNode = rootNode, prevNode = rootNode;
    let immediateParentNode = rootNode;
    // sibling
    while(i < carDataLength) {
      let node = this.makeNode(carData[i]);
      if(currentLevel === carData[i].indent) {
        currentNode["children"].push(node);
        prevNode = node;
        i++;
      }
      // child
      else if(currentLevel + 1 === carData[i].indent) {
        immediateParentNode = currentNode;
        currentNode = prevNode;
        currentNode["children"] ? currentNode["children"].push(node) : currentNode["children"] = [node];       
        currentLevel = currentLevel + 1;
        prevNode = node;
        i++;
      }
     //parent
      else if(currentLevel - 1 === carData[i].indent){
      immediateParentNode["children"] ? immediateParentNode["children"].push(node) : immediateParentNode["children"] = [node];  
      currentNode = immediateParentNode;
      prevNode = node;
      currentLevel = currentLevel - 1;
      i++;
      }
      //reset everything
      else if(currentLevel > carData[i].indent){
        currentLevel = carData[i].indent;
        currentNode = rootNode;
        prevNode = rootNode;
        immediateParentNode = rootNode;
      }
    }
    return rootNode;
  }
  
  generateTreeTable(item){
     const carLogsArray = item.logs;
    carLogsArray.map((log) => {
           for (var val in log.rows) { 
            log.rows[val]['itemName'] = log.itemName;
            log.rows[val]['status'] = log.status;
            log.rows[val]['taskId'] = log.taskId;
            log.rows[val]['time'] = log.time;
            log.rows[val]['workspaceName'] = log.workspaceName;
         }
        
    });
      const processedCarData = carLogsArray.map((log) => {
        var carData = log.rows; 
        
        return this.processNode(carData);       
      });
      this.files = processedCarData.reverse();// need it in ascending order flow specific
      for (let m= 0; m<= this.files.length-1; m++){
        this.expandChildren(this.files[m]);
      }
      
  }
  
  expandChildren(node:TreeNode){// keep all child nodes expanded
    if(node.children){
      node.expanded=true;
      for(let cn of node.children){
        this.expandChildren(cn);
      }
    }
  }
  
  }