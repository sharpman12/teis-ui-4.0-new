import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessMgmtComponent } from './business-mgmt.component';

describe('BusinessMgmtComponent', () => {
  let component: BusinessMgmtComponent;
  let fixture: ComponentFixture<BusinessMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessMgmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
