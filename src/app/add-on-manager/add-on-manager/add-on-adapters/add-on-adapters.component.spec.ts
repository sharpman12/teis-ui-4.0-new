import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnAdaptersComponent } from './add-on-adapters.component';

describe('AddOnAdaptersComponent', () => {
  let component: AddOnAdaptersComponent;
  let fixture: ComponentFixture<AddOnAdaptersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnAdaptersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnAdaptersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
