import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemLibraryReferencesComponent } from './system-library-references.component';

describe('SystemLibraryReferencesComponent', () => {
  let component: SystemLibraryReferencesComponent;
  let fixture: ComponentFixture<SystemLibraryReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemLibraryReferencesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemLibraryReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
