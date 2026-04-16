import { TestBed } from '@angular/core/testing';

import { TaskMgmtGlobalDataService } from './task-mgmt-global-data.service';

describe('TaskMgmtGlobalDataService', () => {
  let service: TaskMgmtGlobalDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskMgmtGlobalDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
