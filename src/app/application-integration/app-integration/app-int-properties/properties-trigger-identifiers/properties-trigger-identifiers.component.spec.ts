import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesTriggerIdentifiersComponent } from './properties-trigger-identifiers.component';

describe('PropertiesTriggerIdentifiersComponent', () => {
  let component: PropertiesTriggerIdentifiersComponent;
  let fixture: ComponentFixture<PropertiesTriggerIdentifiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesTriggerIdentifiersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesTriggerIdentifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
