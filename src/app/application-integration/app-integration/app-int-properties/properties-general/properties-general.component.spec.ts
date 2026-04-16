import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesGeneralComponent } from './properties-general.component';

describe('PropertiesGeneralComponent', () => {
  let component: PropertiesGeneralComponent;
  let fixture: ComponentFixture<PropertiesGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesGeneralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
