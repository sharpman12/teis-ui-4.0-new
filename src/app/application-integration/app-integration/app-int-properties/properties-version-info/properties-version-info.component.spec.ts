import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesVersionInfoComponent } from './properties-version-info.component';

describe('PropertiesVersionInfoComponent', () => {
  let component: PropertiesVersionInfoComponent;
  let fixture: ComponentFixture<PropertiesVersionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesVersionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesVersionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
