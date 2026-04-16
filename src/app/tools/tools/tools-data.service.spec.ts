import { TestBed } from '@angular/core/testing';

import { ToolsDataService } from './tools-data.service';

describe('ToolsDataService', () => {
  let service: ToolsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
