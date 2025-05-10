import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlanCardComponent } from './workout-plan-card.component';

describe('WorkoutPlanCardComponent', () => {
  let component: WorkoutPlanCardComponent;
  let fixture: ComponentFixture<WorkoutPlanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
