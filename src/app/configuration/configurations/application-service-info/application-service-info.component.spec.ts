import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationServiceInfoComponent } from './application-service-info.component';

describe('ApplicationServiceInfoComponent', () => {
  let component: ApplicationServiceInfoComponent;
  let fixture: ComponentFixture<ApplicationServiceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationServiceInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationServiceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
