import { TestBed } from '@angular/core/testing';

import { AdminUserGuard } from './admin-user.guard';

describe('AdminUserGuard', () => {
  let guard: AdminUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
