import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenScriptComponent } from './open-script.component';

describe('OpenScriptComponent', () => {
  let component: OpenScriptComponent;
  let fixture: ComponentFixture<OpenScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenScriptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
