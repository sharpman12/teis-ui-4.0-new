import { TestBed } from '@angular/core/testing';

import { AddOnManagerService } from './add-on-manager.service';

describe('AddOnManagerService', () => {
  let service: AddOnManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddOnManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
