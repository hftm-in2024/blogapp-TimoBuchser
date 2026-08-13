import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { Blog } from '../../shared/blog.model';

const blogSchema = z.object({
  id: z.number(),
  title: z.string(),
  contentPreview: z.string(),
  author: z.string(),
  likes: z.number(),
  comments: z.number(),
  likedByMe: z.boolean(),
  createdByMe: z.boolean(),
  headerImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const blogDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  likes: z.number(),
  comments: z.array(z.unknown()),
  likedByMe: z.boolean(),
  createdByMe: z.boolean(),
  headerImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const blogListSchema = z.object({
  data: z.array(blogSchema),
  pageIndex: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  maxPageSize: z.number(),
});

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    'https://d-cap-blog-backend---v2.whitepond-b96fee4b.westeurope.azurecontainerapps.io/entries';

  async getBlogs(): Promise<Blog[]> {
    try {
      const response = await firstValueFrom(this.http.get<unknown>(this.apiUrl));
      const result = blogListSchema.safeParse(response);

      if (!result.success) {
        console.error('Ungültige API-Antwort', result.error);
        return [];
      }

      return result.data.data;
    } catch (error) {
      console.error('Blogs konnten nicht geladen werden', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Blog | undefined> {
    try {
      const response = await firstValueFrom(this.http.get<unknown>(`${this.apiUrl}/${id}`));
      const result = blogDetailSchema.safeParse(response);

      if (!result.success) {
        console.error('Ungültige API-Antwort', result.error);
        return undefined;
      }

      return {
        id: result.data.id,
        title: result.data.title,
        contentPreview: result.data.content,
        author: result.data.author,
        likes: result.data.likes,
        comments: result.data.comments.length,
        likedByMe: result.data.likedByMe,
        createdByMe: result.data.createdByMe,
        headerImageUrl: result.data.headerImageUrl,
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt,
      };
    } catch (error) {
      console.error(`Blog ${id} konnte nicht geladen werden`, error);
      return undefined;
    }
  }

  async createBlog(blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.post<Blog>(this.apiUrl, blog));
    } catch (error) {
      console.error('Blog konnte nicht erstellt werden', error);
      throw error;
    }
  }

  async updateBlog(id: string, blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.patch<Blog>(`${this.apiUrl}/${id}`, blog));
    } catch (error) {
      console.error(`Blog ${id} konnte nicht aktualisiert werden`, error);
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    } catch (error) {
      console.error(`Blog ${id} konnte nicht gelöscht werden`, error);
      throw error;
    }
  }
}
