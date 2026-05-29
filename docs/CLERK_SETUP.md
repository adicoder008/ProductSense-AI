# Optional Clerk Authentication

ProductSense works without Clerk. To enable signed-in preference persistence:

1. Install Clerk in the web workspace (already listed in `web/package.json` when enabled).
2. Add to `web/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3. Create `web/src/middleware.ts`:

```ts
import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
}
```

4. Wrap `app/layout.tsx` with `<ClerkProvider>`.

**Important:** Do not leave a stub `middleware.ts` with empty exports — Next.js requires a real `default` function.
