import { TestBed } from '@angular/core/testing';

import { WebFlowGuard } from './web-flow.guard';

describe('WebFlowGuard', () => {
  let guard: WebFlowGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(WebFlowGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
