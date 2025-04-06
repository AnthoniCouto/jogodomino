import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnthoniComponent } from './anthoni.component';

describe('AnthoniComponent', () => {
  let component: AnthoniComponent;
  let fixture: ComponentFixture<AnthoniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnthoniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnthoniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
