import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWorkoutComponent } from './new-workout.component';

describe('NewWorkoutComponent', () => {
  let component: NewWorkoutComponent;
  let fixture: ComponentFixture<NewWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewWorkoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
