import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // For the MVP, auth is bypassed to easily demonstrate the flows.
  // In a real environment, we would use @supabase/ssr to check the session
  // and redirect to /login if the user is not an admin.
  
  /*
  const supabase = await createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))
  // check role in profiles table...
  */

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
