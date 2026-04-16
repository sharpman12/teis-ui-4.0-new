import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnSearchComponent } from './add-on-search.component';

describe('AddOnSearchComponent', () => {
  let component: AddOnSearchComponent;
  let fixture: ComponentFixture<AddOnSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
