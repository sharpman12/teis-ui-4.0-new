import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesProcessExecutablesComponent } from './properties-process-executables.component';

describe('PropertiesProcessExecutablesComponent', () => {
  let component: PropertiesProcessExecutablesComponent;
  let fixture: ComponentFixture<PropertiesProcessExecutablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesProcessExecutablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesProcessExecutablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
