import { TestBed } from '@angular/core/testing';

import { ArchiveLogDataService } from './archive-log-data.service';

describe('ArchiveLogDataService', () => {
  let service: ArchiveLogDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchiveLogDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
