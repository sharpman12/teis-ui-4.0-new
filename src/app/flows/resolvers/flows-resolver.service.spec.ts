import { TestBed, inject } from '@angular/core/testing';

import { FlowsResolverService } from './flows-resolver.service';

describe('FlowsResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowsResolverService]
    });
  });

  it('should be created', inject([FlowsResolverService], (service: FlowsResolverService) => {
    expect(service).toBeTruthy();
  }));
});
