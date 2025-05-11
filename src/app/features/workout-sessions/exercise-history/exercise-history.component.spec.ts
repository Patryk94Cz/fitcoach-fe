import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseHistoryComponent } from './exercise-history.component';

describe('ExerciseHistoryComponent', () => {
  let component: ExerciseHistoryComponent;
  let fixture: ComponentFixture<ExerciseHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
