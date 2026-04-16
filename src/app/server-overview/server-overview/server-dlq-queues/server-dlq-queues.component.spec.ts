import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerDlqQueuesComponent } from './server-dlq-queues.component';

describe('ServerDlqQueuesComponent', () => {
  let component: ServerDlqQueuesComponent;
  let fixture: ComponentFixture<ServerDlqQueuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerDlqQueuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerDlqQueuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
