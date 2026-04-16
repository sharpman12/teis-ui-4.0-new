import { TestBed } from '@angular/core/testing';

import { AppIntPropertiesGuard } from './app-int-properties.guard';

describe('AppIntPropertiesGuard', () => {
  let guard: AppIntPropertiesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AppIntPropertiesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
