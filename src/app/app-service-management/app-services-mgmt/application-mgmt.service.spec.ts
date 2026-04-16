import { TestBed } from '@angular/core/testing';

import { ApplicationMgmtService } from './application-mgmt.service';

describe('ApplicationMgmtService', () => {
  let service: ApplicationMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
