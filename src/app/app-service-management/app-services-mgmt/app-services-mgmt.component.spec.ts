import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppServicesMgmtComponent } from './app-services-mgmt.component';

describe('AppServicesMgmtComponent', () => {
  let component: AppServicesMgmtComponent;
  let fixture: ComponentFixture<AppServicesMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppServicesMgmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppServicesMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
