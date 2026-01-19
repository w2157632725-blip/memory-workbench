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

  // 6. 内容安全策略 (Content Security Policy - CSP)
  // 这是最强的防御层，严格限制网页可以加载哪些资源，防止 XSS 攻击。
  // 注意：如果你后续添加了 Google Analytics 或其他脚本，需要在这里把它们的域名加上去。
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `;
  // 将多行字符串转换为单行，去除换行符
  response.headers.set(
    'Content-Security-Policy',
    cspHeader.replace(/\s{2,}/g, ' ').trim()
  );

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
