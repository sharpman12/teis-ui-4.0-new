import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntPropertiesComponent } from './app-int-properties.component';

describe('AppIntPropertiesComponent', () => {
  let component: AppIntPropertiesComponent;
  let fixture: ComponentFixture<AppIntPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
