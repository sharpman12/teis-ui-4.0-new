import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesParametersComponent } from './properties-parameters.component';

describe('PropertiesParametersComponent', () => {
  let component: PropertiesParametersComponent;
  let fixture: ComponentFixture<PropertiesParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
