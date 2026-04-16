import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerQueuesComponent } from './server-queues.component';

describe('ServerQueuesComponent', () => {
  let component: ServerQueuesComponent;
  let fixture: ComponentFixture<ServerQueuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerQueuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerQueuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
