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
      this.#loadFailed('Die Blog-Beiträge konnten nicht geladen werden.');
    }
  }

  async createBlog(blog: Blog): Promise<void> {
    this.#mutationStarted();

    try {
      const created = await this.blogService.createBlog(blog);
      this.#blogCreated(created);
    } catch {
      this.#mutationFailed();
    }
  }

  async updateBlog(blog: Blog): Promise<void> {
    this.#mutationStarted();

    try {
      const updated = await this.blogService.updateBlog(String(blog.id), blog);
      this.#blogUpdated(updated);
    } catch {
      this.#mutationFailed();
    }
  }

  async deleteBlog(id: number): Promise<void> {
    this.#mutationStarted();

    try {
      await this.blogService.deleteBlog(String(id));
      this.#blogDeleted(id);
    } catch {
      this.#mutationFailed();
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

  #mutationStarted(): void {
    this.#state.update((state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  }

  #blogCreated(blog: Blog): void {
    this.#state.update((state) => ({
      ...state,
      blogs: [blog, ...state.blogs],
      loading: false,
    }));
  }

  #blogUpdated(blog: Blog): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.map((item) => (item.id === blog.id ? blog : item)),
      loading: false,
    }));
  }

  #blogDeleted(id: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.filter((blog) => blog.id !== id),
      loading: false,
    }));
  }

  #mutationFailed(): void {
    this.#state.update((state) => ({
      ...state,
      error: 'Die Änderung konnte nicht gespeichert werden.',
      loading: false,
    }));
  }
}
