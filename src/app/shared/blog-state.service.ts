import { computed, inject, Injectable, signal } from '@angular/core';

import { Blog } from './blog.model';
import { BlogService } from './blog.service';

@Injectable({ providedIn: 'root' })
export class BlogStateService {
  private readonly blogService = inject(BlogService);
  private readonly blogsState = signal<Blog[]>([]);
  private readonly loadingState = signal(false);

  readonly blogs = this.blogsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly blogCount = computed(() => this.blogs().length);

  async loadBlogs(): Promise<void> {
    this.loadingState.set(true);
    try {
      const blogs = await this.blogService.getAll();
      this.blogsState.set([...blogs]);
    } finally {
      this.loadingState.set(false);
    }
  }
}
