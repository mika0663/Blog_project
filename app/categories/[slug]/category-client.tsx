"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"

interface CategoryPageClientProps {
  category: { name: string; description: string | null }
  posts: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    cover_image: string | null
    published_at: string | null
    profiles: { full_name?: string; username?: string } | null
  }>
}

export function CategoryPageClient({ category, posts }: CategoryPageClientProps) {
  return (
    <main className="flex-1 container py-12 md:py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Link href="/categories" className="hover:text-primary transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-lg text-pretty">{category.description}</p>
          )}
        </motion.section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="space-y-10"
        >
          {posts?.map((post, index) => (
            <motion.article
              key={post.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex gap-6 pb-10 border-b last:border-b-0"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/blog/${post.slug}`} className="shrink-0 w-48 h-32 overflow-hidden rounded-md">
                  <div
                    className="w-full h-full bg-muted transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: post.cover_image ? `url(${post.cover_image})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </Link>
              </motion.div>
              <div className="flex-1 space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : "Recently"}
                </div>
                <motion.h2
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-2xl font-bold leading-tight group-hover:text-primary transition-colors"
                >
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </motion.h2>
                <p className="text-muted-foreground line-clamp-2 text-pretty">{post.excerpt}</p>
                <div className="text-sm text-muted-foreground">
                  By {post.profiles?.full_name || post.profiles?.username || "Anonymous"}
                </div>
              </div>
            </motion.article>
          ))}
          {!posts?.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="py-20 text-center border rounded-lg bg-muted/30"
            >
              <p className="text-muted-foreground italic font-serif text-lg">
                No stories in this category yet. Check back soon.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  )
}






