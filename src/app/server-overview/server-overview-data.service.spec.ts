import { TestBed } from '@angular/core/testing';

import { ServerOverviewDataService } from './server-overview-data.service';

describe('ServerOverviewDataService', () => {
  let service: ServerOverviewDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerOverviewDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
