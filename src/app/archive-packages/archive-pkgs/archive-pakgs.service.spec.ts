import { TestBed } from '@angular/core/testing';

import { ArchivePakgsService } from './archive-pakgs.service';

describe('ArchivePakgsService', () => {
  let service: ArchivePakgsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivePakgsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
