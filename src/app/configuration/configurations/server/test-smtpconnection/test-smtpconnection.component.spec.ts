import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSMTPConnectionComponent } from './test-smtpconnection.component';

describe('TestSMTPConnectionComponent', () => {
  let component: TestSMTPConnectionComponent;
  let fixture: ComponentFixture<TestSMTPConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestSMTPConnectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSMTPConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
