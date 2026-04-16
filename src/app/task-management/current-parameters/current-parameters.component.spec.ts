import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentParametersComponent } from './current-parameters.component';

describe('CurrentParametersComponent', () => {
  let component: CurrentParametersComponent;
  let fixture: ComponentFixture<CurrentParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
