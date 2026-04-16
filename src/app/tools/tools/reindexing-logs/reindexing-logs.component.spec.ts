import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReindexingLogsComponent } from './reindexing-logs.component';

describe('ReindexingLogsComponent', () => {
  let component: ReindexingLogsComponent;
  let fixture: ComponentFixture<ReindexingLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReindexingLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReindexingLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
