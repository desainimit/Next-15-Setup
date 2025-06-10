import { NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
export function middleware() {
  //   const token = request.cookies.get("auth-token");

  //   if (!token) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }

  return NextResponse.next();
}
