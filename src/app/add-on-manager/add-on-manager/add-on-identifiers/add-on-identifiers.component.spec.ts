import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnIdentifiersComponent } from './add-on-identifiers.component';

describe('AddOnIdentifiersComponent', () => {
  let component: AddOnIdentifiersComponent;
  let fixture: ComponentFixture<AddOnIdentifiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnIdentifiersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnIdentifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
