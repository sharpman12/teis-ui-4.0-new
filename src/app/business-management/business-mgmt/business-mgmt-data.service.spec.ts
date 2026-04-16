import { TestBed } from '@angular/core/testing';

import { BusinessMgmtDataService } from './business-mgmt-data.service';

describe('BusinessMgmtDataService', () => {
  let service: BusinessMgmtDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessMgmtDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
