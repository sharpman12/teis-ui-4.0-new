import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerCompComponent } from './server-comp.component';

describe('ServerCompComponent', () => {
  let component: ServerCompComponent;
  let fixture: ComponentFixture<ServerCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerCompComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
