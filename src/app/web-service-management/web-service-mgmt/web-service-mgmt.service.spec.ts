import { TestBed } from '@angular/core/testing';

import { WebServiceMgmtService } from './web-service-mgmt.service';

describe('WebServiceMgmtService', () => {
  let service: WebServiceMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebServiceMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
