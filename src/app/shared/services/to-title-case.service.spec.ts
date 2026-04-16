import { TestBed } from '@angular/core/testing';

import { ToTitleCaseService } from './to-title-case.service';

describe('ToTitleCaseService', () => {
  let service: ToTitleCaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToTitleCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
