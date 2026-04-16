import { TestBed } from '@angular/core/testing';

import { BusinessMgmtService } from './business-mgmt.service';

describe('BusinessMgmtService', () => {
  let service: BusinessMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
