import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Blog } from './blog.model';
import { BlogService } from './blog.service';
import { BlogStateService } from './blog-state.service';

const blog: Blog = {
  id: 42,
  title: 'Signals testen',
  author: 'Timo',
  contentPreview: 'Testbeitrag',
  likes: 0,
  comments: 0,
  likedByMe: false,
  createdByMe: true,
};

describe('BlogStateService', () => {
  let service: BlogStateService;
  let getAll: ReturnType<typeof vi.fn<() => Blog[]>>;

  beforeEach(() => {
    getAll = vi.fn<() => Blog[]>().mockReturnValue([blog]);
    TestBed.configureTestingModule({
      providers: [{ provide: BlogService, useValue: { getAll } }],
    });
    service = TestBed.inject(BlogStateService);
  });

  it('starts empty without loading or fetching data', () => {
    expect(service.blogs()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.blogCount()).toBe(0);
    expect(getAll).not.toHaveBeenCalled();
  });

  it('sets loading during loading and resets it after publishing blogs', async () => {
    const loading = service.loadBlogs();
    expect(service.loading()).toBe(true);
    expect(service.blogs()).toEqual([]);
    await loading;
    expect(service.loading()).toBe(false);
    expect(service.blogs()).toEqual([blog]);
    expect(service.blogCount()).toBe(1);
    expect(getAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('reactively recomputes blogCount and a dependent computed signal', async () => {
    const summary = computed(() => `${service.blogCount()} Blogs`);
    expect(summary()).toBe('0 Blogs');
    await service.loadBlogs();
    expect(summary()).toBe('1 Blogs');
    getAll.mockReturnValue([blog, { ...blog, id: 43 }, { ...blog, id: 44 }]);
    await service.loadBlogs();
    expect(service.blogCount()).toBe(3);
    expect(summary()).toBe('3 Blogs');
    getAll.mockReturnValue([]);
    await service.loadBlogs();
    expect(service.blogs()).toEqual([]);
    expect(service.blogCount()).toBe(0);
    expect(summary()).toBe('0 Blogs');
  });

  it.each([null, undefined])(
    'rejects invalid data (%s) without losing existing state',
    async (invalid) => {
      await service.loadBlogs();
      // Deliberately violate the typed service contract to test invalid runtime data.
      getAll.mockReturnValue(invalid as unknown as Blog[]);
      await expect(service.loadBlogs()).rejects.toThrow(TypeError);
      expect(service.loading()).toBe(false);
      expect(service.blogs()).toEqual([blog]);
      expect(service.blogCount()).toBe(1);
    },
  );

  it('resets loading and preserves existing blogs when loading fails', async () => {
    await service.loadBlogs();
    const error = new Error('Loading failed');
    getAll.mockImplementation(() => {
      throw error;
    });
    await expect(service.loadBlogs()).rejects.toThrow(error);
    expect(service.loading()).toBe(false);
    expect(service.blogs()).toEqual([blog]);
    expect(service.blogCount()).toBe(1);
  });
});
