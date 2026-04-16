import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntEventLogComponent } from './app-int-event-log.component';

describe('AppIntEventLogComponent', () => {
  let component: AppIntEventLogComponent;
  let fixture: ComponentFixture<AppIntEventLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntEventLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntEventLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
