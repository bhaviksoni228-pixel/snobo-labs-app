import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'
import { getPublicBlogs } from '@/lib/api'

export const metadata = {
  title: 'Blog — Snobo Labs',
  description: 'Thoughts on AI, web development, and building software that actually works.',
}

export default async function BlogList() {
  const blogs = await getPublicBlogs()

  return (
    <main className="relative">
      <BlobBackground />
      <Nav />

      <section className="relative z-5 px-[6vw] pt-32 pb-24 min-h-screen">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
          Snobo Labs / Blog
        </div>
        <h1 className="font-display font-bold text-[clamp(2rem,7vw,3.2rem)] mb-10">
          Notes on AI &amp; building products
        </h1>

        {blogs.length === 0 ? (
          <p className="text-grey-4">No posts yet — check back soon.</p>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {blogs.map((post: any) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block border border-grey-2 rounded-xl p-5 bg-black/60 backdrop-blur-sm hover:border-grey-4 transition-colors"
              >
                <div className="text-xs text-grey-4 mb-2">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  · {post.author}
                </div>
                <h2 className="font-display font-semibold text-xl mb-2">{post.title}</h2>
                <p className="text-sm text-grey-5 leading-relaxed">{post.excerpt}</p>
              </a>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}