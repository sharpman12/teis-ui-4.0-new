import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdapterInfoComponent } from './adapter-info.component';

describe('AdapterInfoComponent', () => {
  let component: AdapterInfoComponent;
  let fixture: ComponentFixture<AdapterInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdapterInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdapterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
