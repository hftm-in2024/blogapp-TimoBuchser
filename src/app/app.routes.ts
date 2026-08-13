import { Routes } from '@angular/router';
import { BlogOverviewComponent } from './feature/blog-overview/blog-overview.component';
import { blogResolver } from './feature/blog/blog.resolver';

export const routes: Routes = [
  {
    path: '',
    component: BlogOverviewComponent,
    title: 'Blog-Übersicht',
  },
  {
    path: 'blog/:id',
    loadComponent: () =>
      import('./feature/blog-detail/blog-detail.component').then(
        (module) => module.BlogDetailComponent,
      ),
    resolve: { blog: blogResolver },
    title: 'Blog-Detail',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./feature/about/about.component').then((module) => module.AboutComponent),
    title: 'Über uns',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./feature/not-found/not-found.component').then(
        (module) => module.NotFoundComponent,
      ),
    title: 'Seite nicht gefunden',
  },
];
