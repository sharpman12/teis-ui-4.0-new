import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntManualAutoDeployComponent } from './app-int-manual-auto-deploy.component';

describe('AppIntManualAutoDeployComponent', () => {
  let component: AppIntManualAutoDeployComponent;
  let fixture: ComponentFixture<AppIntManualAutoDeployComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntManualAutoDeployComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntManualAutoDeployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
