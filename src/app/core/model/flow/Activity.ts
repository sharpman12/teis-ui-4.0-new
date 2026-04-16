import { Injectable } from '@angular/core';
import Adapter from '../../interface/adapter';

export class Activity {
  constructor(
    public id: number,
    public status: string,
    public scriptName: string,
    public time: number,
    public taskId: number,
    public activityId: number,
    public type: string,
    public transExecutableId: number
  ) { }
}


@Injectable({
  providedIn: 'root'
})
export class ActivityAdapter implements Adapter<Activity> {

  adapt(item: any): Activity {

    return new Activity(
      item.id,
      item.status,
      item.scriptName,
      item.time,
      item.taskId,
      item.activityId,
      item.type,
      item.transExecutableId
    );
  }
}
