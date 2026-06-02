import {NextResponse} from "next/server"
import type {NextRequest} from "next/server"

export function proxy(request: NextRequest) {
  const access_token = request.cookies.get("access_token")?.value
  const {pathname} = request.nextUrl

  if (!access_token && pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (access_token && pathname === "/login") {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/login"]
}