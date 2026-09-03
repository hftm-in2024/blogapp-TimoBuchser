import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const bffInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.bffUrl)) return next(request);

  return next(
    request.clone({
      withCredentials: true,
      setHeaders: { 'X-Requested-With': 'XMLHttpRequest' },
    }),
  );
};
