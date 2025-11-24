# My Medium — Next.js Publishing Platform

A full-featured publishing platform inspired by Medium, built with Next.js App Router and TypeScript. It demonstrates rich content creation, authentication, social interactions, performant rendering, and deployment to Vercel.

## Key Features

- Authentication
  - Custom JWT auth (signup/login), protected routes
- Editor and Media
  - Rich text editor (Jodit), image uploads to a storage endpoint
- Posts
  - Create, edit, publish drafts, tags, search
- Social
  - Comments with nested replies, likes/claps, follow/unfollow
- Feeds
  - Home feed, tag pages, personalized “Following” feed
- Data Fetching and State
  - React Query-based fetching, optimistic updates, Context for light global state
- TypeScript and Quality
  - Typed models and API responses, ESLint, Testing Library
- SEO and Performance
  - Dynamic metadata, Open Graph, ISR/SSG, next/image

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript
- MongoDB with Mongoose
- @tanstack/react-query
- jodit-react
- Tailwind CSS v4
- Testing Library, Jest DOM

## Repository Structure

```
my-medium/
  app/
    api/
      auth/
        login/route.ts
        signup/route.ts
      comment/
        [id]/like/route.ts
        route.ts
      post/
        [id]/
          clap/route.ts
          comments/route.ts
          route.ts
        [slug]/
        route.ts
      uploads/route.ts
      users/
        [id]/
          follow/route.ts
          followers/route.ts
          following/route.ts
      route.ts
    components/
      ui/
        button.tsx
        card.tsx
      Auth-form.tsx
      comment-section.tsx
      Container.tsx
      editor-preview.tsx
      feedCard.tsx
      follow-button.tsx
      footer.tsx
      header.tsx
      image-uploader.tsx
      like-button.tsx
      loading-skeleton.tsx
      pagination.tsx
      ProtectedRoute.tsx
      rich-text-editor.tsx
      search-bar.tsx
      tag-filter.tsx
    dashboard/page.tsx
    draft/page.tsx
    explore/page.tsx
    hooks/
      use-debounce.ts
      use-infinite-scroll.ts
      use-pagination.tsx
      use-post.ts
      use-user-stats.ts
    lib/
      models/
        comment.ts
        post.ts
        user.ts
      auth-context.tsx
      auth.ts
      db.ts
      post-context.tsx
      search-context.tsx
      social-context.tsx
    login/page.tsx
    posts/[slug]/page.tsx
    profile/
      [id]/
        followers/page.tsx
        following/page.tsx
        page.tsx
      page.tsx
    signup/page.tsx
    tags/[tag]/page.tsx
    write/page.tsx
    favicon.ico
    globals.css
    icon.svg
    layout.tsx
    page.tsx
  public/
    file.svg
    globe.svg
    icon.svg
    next.svg
    vercel.svg
    window.svg
  .gitignore
  eslint.config.mjs
  next.config.ts
  package.json
  postcss.config.mjs
  README.md
  TODO.md
  tsconfig.json
```

## Prerequisites

- Node.js 18+
- MongoDB connection URI
- Optional: Cloud storage (e.g., Cloudinary) for images

## Environment Variables

Create `.env.local` in `my-medium/`:

```
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-strong-secret>

# Optional Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

## Installation and Setup

```
cd my-medium
npm install

# Development
npm run dev
# Local: http://localhost:3000

# Production build
npm run build
npm start
```

## Database

- The app uses Mongoose models under `app/lib/models/`.
- Ensure `MONGODB_URI` points to your database.
- On first run, sign up to create a user.

## Authentication

- Signup: `POST /api/auth/signup`
- Login: `POST /api/auth/login`
- A secure httpOnly cookie stores the JWT; server routes use cookie to authenticate.
- Protected pages: `/write`, `/draft`, `/dashboard`.

## Posts API

- `GET /api/post?page=1&tag=react&authorId=<id>&published=true`
- `POST /api/post`
  - body: `{ title, content, excerpt?, tags?, published?, image? }`
- `GET /api/post/[id or slug]` (published posts)
- `PUT /api/post/[id]` (author only)
- `DELETE /api/post/[id]` (author only)

## Comments API (Nested via parentId)

- `GET /api/post/[id]/comments`
- `POST /api/post/[id]/comments`
  - body: `{ content, parentId? }`
- `POST /api/comment/[id]/like`

## Claps / Likes

- `POST /api/post/[id]/clap` toggles clap with counts (optimistic UI supported)
- `POST /api/comment/[id]/like` toggles comment like

## Follows

- `POST /api/users/[id]/follow` toggles follow/unfollow, returns counts
- `GET /api/users/[id]/followers`
- `GET /api/users/[id]/following?page=1&limit=20`

## Personalized Feed

- When enabled: `GET /api/post?followedBy=<userId>` returns posts from followed authors
- Use the “Following” toggle/tab in the home or explore feed

## UI and State Management

- Rich text editor: `app/components/rich-text-editor.tsx`
- Image uploads: `app/components/image-uploader.tsx` -> `/api/uploads`
- Social interactions: `app/lib/social-context.tsx` with optimistic updates
- Data fetching: React Query provider set in `app/layout.tsx`; hooks leverage `useQuery` / `useMutation`

## SEO and SSG/ISR

- Posts page `app/posts/[slug]/page.tsx` uses `generateMetadata` and ISR (`revalidate`) for SEO/performance
- Add `app/sitemap.ts` and `app/robots.txt` routes as needed for production

## Testing

- Testing stack:
  - `@testing-library/react`, `@testing-library/jest-dom`
- Run tests (add script if not present):

```
# Example script to add in package.json:
# "test": "jest"

npm run test
```

## Development Notes / Common Issues

- Turbopack root warning
  - `next.config.ts` sets `experimental.turbopack.root = __dirname` to silence multi-lockfile warnings
- Source map warnings
  - Harmless in dev; `productionBrowserSourceMaps` is disabled to reduce noise
- Mongoose MissingSchemaError
  - Import models where used (e.g., `import User from '@/lib/models/user'`) before `populate`
- ObjectId validation
  - Routes validate `id` params and return 400 on invalid ids

## Deployment to Vercel

1. Push `my-medium` to GitHub
2. Import in Vercel, set environment variables from `.env.local`
   - `MONGODB_URI`, `JWT_SECRET` (and Cloudinary vars if used)
3. Build command: `npm run build`
4. Output directory: `.next`

Notes:
- Ensure ISR `revalidate` settings on pages that need freshness (posts)
- Consider adding sitemap/robots for SEO

## Roadmap

- Improve search (prefix, fuzzy, or Algolia)
- Richer editor features (code blocks, embeds)
- Notifications for follows/likes/comments
- Increase test coverage and add e2e tests

## License

MIT (or your preferred license)
