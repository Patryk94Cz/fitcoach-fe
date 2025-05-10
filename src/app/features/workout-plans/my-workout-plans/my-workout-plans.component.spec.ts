import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyWorkoutPlansComponent } from './my-workout-plans.component';

describe('MyWorkoutPlansComponent', () => {
  let component: MyWorkoutPlansComponent;
  let fixture: ComponentFixture<MyWorkoutPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyWorkoutPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyWorkoutPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
