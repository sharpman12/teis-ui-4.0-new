import { TestBed } from '@angular/core/testing';

import { AdminProfileGuard } from './admin-profile.guard';

describe('AdminProfileGuard', () => {
  let guard: AdminProfileGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminProfileGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
