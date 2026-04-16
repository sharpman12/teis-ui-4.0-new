import { TestBed } from '@angular/core/testing';

import { FlowModelGuard } from './flow-model.guard';

describe('FlowModelGuard', () => {
  let guard: FlowModelGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FlowModelGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
