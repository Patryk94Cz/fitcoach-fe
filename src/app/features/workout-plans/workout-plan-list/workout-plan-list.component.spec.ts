import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlanListComponent } from './workout-plan-list.component';

describe('WorkoutPlanListComponent', () => {
  let component: WorkoutPlanListComponent;
  let fixture: ComponentFixture<WorkoutPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlanListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
