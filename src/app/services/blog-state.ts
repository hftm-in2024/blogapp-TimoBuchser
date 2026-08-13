import { computed, inject, Injectable, signal } from '@angular/core';
import { BlogService } from '../feature/blog/blog.service';
import { Blog } from '../shared/blog.model';

type BlogState = {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class BlogStateService {
  private readonly blogService = inject(BlogService);

  // State
  readonly #state = signal<BlogState>({
    blogs: [],
    loading: false,
    error: null,
  });

  // Derived State
  readonly blogs = computed(() => this.#state().blogs);
  readonly loading = computed(() => this.#state().loading);
  readonly error = computed(() => this.#state().error);
  readonly blogCount = computed(() => this.blogs().length);

  // Actions
  async loadBlogs(): Promise<void> {
    this.#loadStarted();

    try {
      const blogs = await this.blogService.getBlogs();
      this.#loadSucceeded(blogs);
    } catch {
      this.#loadFailed('Blogs konnten nicht geladen werden.');
    }
  }

  // Reducer
  #loadStarted(): void {
    this.#state.update((state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  }

  #loadSucceeded(blogs: Blog[]): void {
    this.#state.update((state) => ({
      ...state,
      blogs,
      loading: false,
    }));
  }

  #loadFailed(message: string): void {
    this.#state.update((state) => ({
      ...state,
      error: message,
      loading: false,
    }));
  }
}
