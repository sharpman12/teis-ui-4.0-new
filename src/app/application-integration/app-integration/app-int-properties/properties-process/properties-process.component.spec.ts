import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesProcessComponent } from './properties-process.component';

describe('PropertiesProcessComponent', () => {
  let component: PropertiesProcessComponent;
  let fixture: ComponentFixture<PropertiesProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
