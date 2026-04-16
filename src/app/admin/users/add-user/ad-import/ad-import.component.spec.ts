import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdImportComponent } from './ad-import.component';

describe('AdImportComponent', () => {
  let component: AdImportComponent;
  let fixture: ComponentFixture<AdImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
