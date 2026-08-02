import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'
import { getBlogBySlug } from '@/lib/api'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — Snobo Labs`,
    description: post.excerpt,
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogBySlug(params.slug)
  if (!post) return notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Snobo Labs' },
    datePublished: post.publishedAt,
  }

  return (
    <main className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlobBackground />
      <Nav />

      <article className="relative z-5 px-[6vw] pt-32 pb-24 max-w-2xl mx-auto">
        <a href="/blog" className="text-sm text-grey-4 underline mb-6 inline-block">
          ← All posts
        </a>
        <div className="text-xs text-grey-4 mb-3">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          · {post.author}
        </div>
        <h1 className="font-display font-bold text-[clamp(1.8rem,6vw,2.8rem)] mb-8 leading-tight">
          {post.title}
        </h1>
        <div className="prose-content text-grey-5 leading-relaxed whitespace-pre-line text-base">
          {post.content}
        </div>
      </article>

      <Footer />
    </main>
  )
}