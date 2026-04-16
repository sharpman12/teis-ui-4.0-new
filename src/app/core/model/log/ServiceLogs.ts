import { ServiceLog } from './ServiceLog';


export class ServiceLogs {
  constructor(
    public timeFrame: string,
    public totalLogs: number,
    public logs: Array<ServiceLog>
  ) { }
}

