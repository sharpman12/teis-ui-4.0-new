import { TestBed } from '@angular/core/testing';

import { FlowGroupGuard } from './flow-group.guard';

describe('FlowGroupGuard', () => {
  let guard: FlowGroupGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FlowGroupGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
