import { TestBed } from '@angular/core/testing';

import { ServerOverviewService } from './server-overview.service';

describe('ServerOverviewService', () => {
  let service: ServerOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
