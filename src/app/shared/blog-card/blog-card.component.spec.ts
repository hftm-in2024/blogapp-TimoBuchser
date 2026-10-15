import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Blog } from '../blog.model';
import { BlogCardComponent } from './blog-card.component';

const blog: Blog = {
  id: 42,
  title: 'Signals testen',
  author: 'Timo',
  contentPreview: 'Testbeitrag',
  likes: 3,
  comments: 0,
  likedByMe: false,
  createdByMe: true,
};

describe('BlogCardComponent', () => {
  let fixture: ComponentFixture<BlogCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogCardComponent);
    fixture.componentRef.setInput('model', { ...blog });
    await fixture.whenStable();
  });

  it('creates the card with its required model', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the model title and updates it when the input changes', async () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('mat-card-title')?.textContent).toBe(blog.title);
    fixture.componentRef.setInput('model', { ...blog, title: 'Neuer Titel' });
    await fixture.whenStable();
    expect(element.querySelector('mat-card-title')?.textContent).toBe('Neuer Titel');
  });

  it('emits the blog id exactly once when the like button is clicked', () => {
    const liked = vi.fn();
    const subscription = fixture.componentInstance.liked.subscribe(liked);
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-label="Blog liken"]')!.click();
    expect(liked).toHaveBeenCalledExactlyOnceWith(blog.id);
    subscription.unsubscribe();
  });
});
