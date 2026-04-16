import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOverviewProcessEngineComponent } from './comp-overview-process-engine.component';

describe('CompOverviewProcessEngineComponent', () => {
  let component: CompOverviewProcessEngineComponent;
  let fixture: ComponentFixture<CompOverviewProcessEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompOverviewProcessEngineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOverviewProcessEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
