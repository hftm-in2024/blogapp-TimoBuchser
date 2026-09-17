import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Blog } from '../../shared/blog.model';

@Component({
  selector: 'app-blog-detail',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
})
export class BlogDetailComponent {
  readonly blog = input<Blog>();
}
