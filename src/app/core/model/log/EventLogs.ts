

export class EventLogs {
  constructor(
    public timeFrame: string,
    public totalLogs: number,
    public logs: Array<EventLog>,
    public maxRecordsReached?: boolean,
  ) { }
}


export class EventLog {
  constructor(
    public rowno: number,
    public indent: number,
    public row: string,
    public time: string,
    public level: string,
    public taskId: string,
    public itemId: string
  ) { }
}
