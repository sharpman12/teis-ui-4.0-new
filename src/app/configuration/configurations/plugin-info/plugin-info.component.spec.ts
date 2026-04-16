import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginInfoComponent } from './plugin-info.component';

describe('PluginInfoComponent', () => {
  let component: PluginInfoComponent;
  let fixture: ComponentFixture<PluginInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
