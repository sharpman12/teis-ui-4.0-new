import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditParameterComponent } from './edit-parameter.component';

describe('EditParameterComponent', () => {
  let component: EditParameterComponent;
  let fixture: ComponentFixture<EditParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditParameterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
