export class ServiceLog {
    constructor( 
          public time: string,
          public status: string,
          public taskId : string,
          public rows : Array<LogEntry>,
          public workspaceName : string,
          public itemName : string,
          public note?: string
    ){}     
}


export class LogEntry {
    constructor( 
          public rowno: number,
          public indent: number,
          public row : string,
          public time : string,
          public level : string
    ){}     
}



