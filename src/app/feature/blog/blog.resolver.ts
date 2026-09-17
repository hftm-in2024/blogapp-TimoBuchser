import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Blog } from '../../shared/blog.model';
import { BlogService } from './blog.service';

export const blogResolver: ResolveFn<Blog | undefined> = (route) => {
  const blogService = inject(BlogService);
  return blogService.getById(route.paramMap.get('id') ?? '');
};
