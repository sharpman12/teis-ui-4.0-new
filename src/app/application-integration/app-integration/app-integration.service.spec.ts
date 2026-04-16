import { TestBed } from '@angular/core/testing';

import { AppIntegrationService } from './app-integration.service';

describe('AppIntegrationService', () => {
  let service: AppIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
