import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntServicesComponent } from './app-int-services.component';

describe('AppIntServicesComponent', () => {
  let component: AppIntServicesComponent;
  let fixture: ComponentFixture<AppIntServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
