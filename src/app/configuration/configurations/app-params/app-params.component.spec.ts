import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppParamsComponent } from './app-params.component';

describe('AppParamsComponent', () => {
  let component: AppParamsComponent;
  let fixture: ComponentFixture<AppParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppParamsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
