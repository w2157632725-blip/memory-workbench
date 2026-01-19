import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. 强制 HSTS (HTTP Strict Transport Security)
  // 告诉浏览器：未来一年内，必须强制使用 HTTPS 访问此网站，不允许使用 HTTP。
  // 这能有效防止中间人攻击和运营商劫持。
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // 2. 防止 MIME 类型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 3. 防止点击劫持 (Clickjacking)
  // 禁止其他网站通过 iframe 嵌入你的网站
  response.headers.set('X-Frame-Options', 'DENY');

  // 4. 开启 XSS 过滤防护
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 5. 引用策略
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// 配置匹配路径：对所有请求生效，排除静态资源和 API 图片等
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
