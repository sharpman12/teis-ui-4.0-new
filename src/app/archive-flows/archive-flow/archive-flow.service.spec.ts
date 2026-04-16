import { TestBed } from '@angular/core/testing';

import { ArchiveFlowService } from './archive-flow.service';

describe('ArchiveFlowService', () => {
  let service: ArchiveFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchiveFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
