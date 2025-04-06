import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdelsonComponent } from './adelson.component';

describe('AdelsonComponent', () => {
  let component: AdelsonComponent;
  let fixture: ComponentFixture<AdelsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdelsonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdelsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
