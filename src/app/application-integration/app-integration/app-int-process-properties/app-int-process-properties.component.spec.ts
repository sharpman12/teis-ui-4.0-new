import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntProcessPropertiesComponent } from './app-int-process-properties.component';

describe('AppIntProcessPropertiesComponent', () => {
  let component: AppIntProcessPropertiesComponent;
  let fixture: ComponentFixture<AppIntProcessPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntProcessPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntProcessPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
