import { TestBed } from '@angular/core/testing';

import { AdminGroupGuard } from './admin-group.guard';

describe('AdminGroupGuard', () => {
  let guard: AdminGroupGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminGroupGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
