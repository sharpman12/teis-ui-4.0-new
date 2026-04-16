import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntAddNoteComponent } from './app-int-add-note.component';

describe('AppIntAddNoteComponent', () => {
  let component: AppIntAddNoteComponent;
  let fixture: ComponentFixture<AppIntAddNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntAddNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntAddNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
