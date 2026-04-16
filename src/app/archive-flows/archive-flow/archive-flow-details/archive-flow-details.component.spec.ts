import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveFlowDetailsComponent } from './archive-flow-details.component';

describe('ArchiveFlowDetailsComponent', () => {
  let component: ArchiveFlowDetailsComponent;
  let fixture: ComponentFixture<ArchiveFlowDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveFlowDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveFlowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
