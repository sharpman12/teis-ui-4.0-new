import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesWebServiceParametersComponent } from './properties-web-service-parameters.component';

describe('PropertiesWebServiceParametersComponent', () => {
  let component: PropertiesWebServiceParametersComponent;
  let fixture: ComponentFixture<PropertiesWebServiceParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesWebServiceParametersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesWebServiceParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
