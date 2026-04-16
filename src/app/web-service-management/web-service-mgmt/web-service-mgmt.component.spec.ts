import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebServiceMgmtComponent } from './web-service-mgmt.component';

describe('WebServiceMgmtComponent', () => {
  let component: WebServiceMgmtComponent;
  let fixture: ComponentFixture<WebServiceMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebServiceMgmtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebServiceMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
