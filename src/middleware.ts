import { authMiddleware } from '@/lib/middleware';

export { authMiddleware as middleware };

export const config = {
  // Solo protege páginas — las API routes validan su propio auth y siempre devuelven JSON
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
