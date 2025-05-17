import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseHistoryTableComponent } from './exercise-history-table.component';

describe('ExerciseHistoryTableComponent', () => {
  let component: ExerciseHistoryTableComponent;
  let fixture: ComponentFixture<ExerciseHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseHistoryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
