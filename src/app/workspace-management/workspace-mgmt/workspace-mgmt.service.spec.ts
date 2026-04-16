import { TestBed } from '@angular/core/testing';

import { WorkspaceMgmtService } from './workspace-mgmt.service';

describe('WorkspaceMgmtService', () => {
  let service: WorkspaceMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
