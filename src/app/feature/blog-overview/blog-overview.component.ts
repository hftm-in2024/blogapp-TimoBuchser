import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlogStateService } from '../../services/blog-state';
import { BlogCardComponent } from '../../shared/blog-card/blog-card.component';
import { Blog } from '../../shared/blog.model';

@Component({
  selector: 'app-blog-overview',
  imports: [BlogCardComponent, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './blog-overview.component.html',
  styleUrl: './blog-overview.component.scss',
})
export class BlogOverviewComponent implements OnInit {
  readonly state = inject(BlogStateService);

  async ngOnInit(): Promise<void> {
    await this.state.loadBlogs();
  }

  onAuthorChanged(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.state.setAuthor(select.value);
  }

  async createBlog(): Promise<void> {
    const title = prompt('Titel des neuen Blogs:');
    if (!title) return;

    const contentPreview = prompt('Vorschautext:');
    if (!contentPreview) return;

    const now = new Date().toISOString();

    const blog: Blog = {
      id: 0,
      title,
      contentPreview,
      author: 'Timo Buchser',
      likes: 0,
      comments: 0,
      likedByMe: false,
      createdByMe: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.state.createBlog(blog);
  }

  async editBlog(blog: Blog): Promise<void> {
    const title = prompt('Titel bearbeiten:', blog.title);
    if (!title) return;

    const contentPreview = prompt('Vorschautext bearbeiten:', blog.contentPreview);
    if (!contentPreview) return;

    const updatedBlog: Blog = {
      ...blog,
      title,
      contentPreview,
      updatedAt: new Date().toISOString(),
    };

    await this.state.updateBlog(updatedBlog);
  }

  async deleteBlog(id: number): Promise<void> {
    if (!confirm('Diesen Blog wirklich löschen?')) return;

    await this.state.deleteBlog(id);
  }

  async onBlogLiked(blogId: number): Promise<void> {
    const blog = this.state.blogs().find((item) => item.id === blogId);
    if (!blog) return;

    const updatedBlog: Blog = {
      ...blog,
      likedByMe: !blog.likedByMe,
      likes: blog.likes + (blog.likedByMe ? -1 : 1),
      updatedAt: new Date().toISOString(),
    };

    await this.state.updateBlog(updatedBlog);
  }
}
