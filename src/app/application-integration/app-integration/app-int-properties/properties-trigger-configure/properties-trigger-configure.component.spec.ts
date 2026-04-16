import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesTriggerConfigureComponent } from './properties-trigger-configure.component';

describe('PropertiesTriggerConfigureComponent', () => {
  let component: PropertiesTriggerConfigureComponent;
  let fixture: ComponentFixture<PropertiesTriggerConfigureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesTriggerConfigureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesTriggerConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
