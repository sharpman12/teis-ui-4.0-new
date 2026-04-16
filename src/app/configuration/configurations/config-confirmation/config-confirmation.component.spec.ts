import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigConfirmationComponent } from './config-confirmation.component';

describe('ConfigConfirmationComponent', () => {
  let component: ConfigConfirmationComponent;
  let fixture: ComponentFixture<ConfigConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
