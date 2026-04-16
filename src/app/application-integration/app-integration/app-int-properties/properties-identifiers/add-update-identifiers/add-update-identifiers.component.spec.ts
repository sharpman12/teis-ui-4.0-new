import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateIdentifiersComponent } from './add-update-identifiers.component';

describe('AddUpdateIdentifiersComponent', () => {
  let component: AddUpdateIdentifiersComponent;
  let fixture: ComponentFixture<AddUpdateIdentifiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateIdentifiersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateIdentifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
