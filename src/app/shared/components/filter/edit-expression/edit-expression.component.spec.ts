import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExpressionComponent } from './edit-expression.component';

describe('EditExpressionComponent', () => {
  let component: EditExpressionComponent;
  let fixture: ComponentFixture<EditExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
