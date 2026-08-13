import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
})
export class BlogCardComponent {
  readonly model = input.required<Blog>();
  readonly liked = output<number>();
  readonly edited = output<Blog>();
  readonly deleted = output<number>();

  onLike(): void {
    this.liked.emit(this.model().id);
  }
}
