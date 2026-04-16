import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnManagerComponent } from './add-on-manager.component';

describe('AddOnManagerComponent', () => {
  let component: AddOnManagerComponent;
  let fixture: ComponentFixture<AddOnManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
