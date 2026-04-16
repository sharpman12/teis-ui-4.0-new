import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnPluginsComponent } from './add-on-plugins.component';

describe('AddOnPluginsComponent', () => {
  let component: AddOnPluginsComponent;
  let fixture: ComponentFixture<AddOnPluginsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnPluginsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnPluginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
