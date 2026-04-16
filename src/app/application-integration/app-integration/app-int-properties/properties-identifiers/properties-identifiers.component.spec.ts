import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesIdentifiersComponent } from './properties-identifiers.component';

describe('PropertiesIdentifiersComponent', () => {
  let component: PropertiesIdentifiersComponent;
  let fixture: ComponentFixture<PropertiesIdentifiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesIdentifiersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesIdentifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
