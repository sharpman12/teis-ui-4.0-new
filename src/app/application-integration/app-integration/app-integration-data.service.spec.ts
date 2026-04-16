import { TestBed } from '@angular/core/testing';

import { AppIntegrationDataService } from './app-integration-data.service';

describe('AppIntegrationDataService', () => {
  let service: AppIntegrationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppIntegrationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
