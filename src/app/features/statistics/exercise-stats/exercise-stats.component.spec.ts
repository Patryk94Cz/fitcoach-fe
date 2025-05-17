import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseStatsComponent } from './exercise-stats.component';

describe('ExerciseStatsComponent', () => {
  let component: ExerciseStatsComponent;
  let fixture: ComponentFixture<ExerciseStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
