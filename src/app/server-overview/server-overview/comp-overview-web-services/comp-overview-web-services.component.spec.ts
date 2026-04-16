import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOverviewWebServicesComponent } from './comp-overview-web-services.component';

describe('CompOverviewWebServicesComponent', () => {
  let component: CompOverviewWebServicesComponent;
  let fixture: ComponentFixture<CompOverviewWebServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompOverviewWebServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOverviewWebServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
