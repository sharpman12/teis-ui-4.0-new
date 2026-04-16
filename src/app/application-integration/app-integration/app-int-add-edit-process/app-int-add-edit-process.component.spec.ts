import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntAddEditProcessComponent } from './app-int-add-edit-process.component';

describe('AppIntAddEditProcessComponent', () => {
  let component: AppIntAddEditProcessComponent;
  let fixture: ComponentFixture<AppIntAddEditProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntAddEditProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntAddEditProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
