import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntegrationComponent } from './app-integration.component';

describe('AppIntegrationComponent', () => {
  let component: AppIntegrationComponent;
  let fixture: ComponentFixture<AppIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntegrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
