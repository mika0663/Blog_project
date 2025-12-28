"use client"

import { BlogHeader } from "@/components/blog-header"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@apollo/client/react"
import { GET_PAGINATED_POSTS, GET_PAGINATED_POSTS_BY_CATEGORY, GET_CATEGORIES, GET_CATEGORY_BY_SLUG } from "@/lib/graphql/queries"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useEffect, useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

const POSTS_PER_PAGE = 5

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const page = parseInt(searchParams.get("page") || "1", 10)
  const categorySlug = searchParams.get("category") || null
  
  const offset = (page - 1) * POSTS_PER_PAGE

  // Get category ID from slug if category is selected
  const { data: categoryData } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug: categorySlug! },
    skip: !categorySlug || categorySlug === null,
    fetchPolicy: "cache-first",
  })

  const categoryId = (categoryData as any)?.categoriesCollection?.edges?.[0]?.node?.id || null

  // Fetch posts with pagination
  const { data: postsData, loading: postsLoading, error: postsError } = useQuery(
    categoryId ? GET_PAGINATED_POSTS_BY_CATEGORY : GET_PAGINATED_POSTS,
    {
      variables: categoryId
        ? {
            limit: POSTS_PER_PAGE,
            offset,
            categoryId,
          }
        : {
            limit: POSTS_PER_PAGE,
            offset,
          },
      skip: categorySlug !== null && !categoryId, // Wait for category ID if category slug is provided
      fetchPolicy: "cache-and-network",
    }
  )

  // Fetch categories
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-first",
  })

  const categories = (categoriesData as any)?.categoriesCollection?.edges?.map((edge: any) => edge.node) || []
  
  // Create a map of category IDs to category objects for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((cat: any) => {
      map.set(cat.id, cat)
    })
    return map
  }, [categories])

  const [profileMap, setProfileMap] = useState<Map<string, any>>(new Map())

  // Fetch profiles for posts
  useEffect(() => {
    async function fetchProfiles() {
      const posts = (postsData as any)?.postsCollection?.edges?.map((edge: any) => edge.node) || []
      const authorIds = [...new Set(posts.map((p: any) => p.author_id).filter(Boolean))]
      
      if (authorIds.length > 0) {
        const supabase = createClient()
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", authorIds)
        
        if (profiles) {
          const map = new Map(profiles.map((p: any) => [p.id, p]))
          setProfileMap(map)
        }
      }
    }
    
    if (postsData) {
      fetchProfiles()
    }
  }, [postsData])

  const posts = useMemo(() => {
    return (
      (postsData as any)?.postsCollection?.edges?.map((edge: any) => {
        const node = edge.node
        return {
          ...node,
          categories: node.category_id ? categoryMap.get(node.category_id) || null : null,
          profiles: node.author_id ? profileMap.get(node.author_id) || null : null,
        }
      }) || []
    )
  }, [postsData, categoryMap, profileMap])
  const hasNextPage = (postsData as any)?.postsCollection?.pageInfo?.hasNextPage || false
  const hasPreviousPage = (postsData as any)?.postsCollection?.pageInfo?.hasPreviousPage || false

  // Log errors in development
  useEffect(() => {
    if (postsError && process.env.NODE_ENV === 'development') {
      console.error('Posts query error:', postsError)
      console.error('Error details:', {
        message: postsError.message,
        graphQLErrors: postsError.graphQLErrors,
        networkError: postsError.networkError,
      })
    }
  }, [postsError])

  const totalPages = useMemo(() => {
    // Estimate total pages based on current page and hasNextPage
    if (!hasNextPage && page === 1) return 1
    if (hasNextPage) return page + 1 // At least one more page
    return page
  }, [hasNextPage, page])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage === 1) {
      params.delete("page")
    } else {
      params.set("page", newPage.toString())
    }
    router.push(`/?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams()
    if (slug) {
      params.set("category", slug)
    }
    params.delete("page") // Reset to page 1 when changing category
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-balance">
              The latest in design, code, and editorial thinking.
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl text-pretty">
              Exploring the intersection of creativity and technology through thoughtful articles and deep dives.
            </p>
          </motion.section>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={!categorySlug ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(null)}
                className="cursor-pointer"
              >
                All
              </Button>
            </motion.div>
            {categoriesLoading ? (
              <div className="text-sm text-muted-foreground">Loading categories...</div>
            ) : (
              categories.map((cat: any, index: number) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={categorySlug === cat.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className="cursor-pointer"
                  >
                    {cat.name}
                  </Button>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Posts Grid */}
          {postsLoading ? (
            <div className="grid gap-12 md:grid-cols-2">
              {[...Array(POSTS_PER_PAGE)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : postsError ? (
            <div className="col-span-full py-20 text-center border rounded-lg bg-destructive/10">
              <p className="text-destructive font-serif text-lg">
                Error loading posts. Please try again later.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-muted-foreground mt-2">
                  {postsError.message}
                </p>
              )}
            </div>
          ) : posts.length === 0 ? (
            <div className="col-span-full py-20 text-center border rounded-lg bg-muted/30">
              <p className="text-muted-foreground italic font-serif text-lg">
                No stories published yet. Stay tuned.
              </p>
            </div>
          ) : (
            <>
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
                className="grid gap-12 md:grid-cols-2"
              >
                {posts.map((post: any, index: number) => (
                  <motion.article
                    key={post.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group space-y-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg">
                        <motion.div
                          className="aspect-video bg-muted transition-transform duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: post.cover_image ? `url(${post.cover_image})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </motion.div>
                    <div className="space-y-2">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        <span>{post.categories?.name || "Uncategorized"}</span>
                        <span>•</span>
                        <span>
                          {post.published_at
                            ? format(new Date(post.published_at), "MMM d, yyyy")
                            : "Recently"}
                        </span>
                      </motion.div>
                      <motion.h2
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        className="font-serif text-2xl font-bold leading-tight group-hover:text-primary transition-colors"
                      >
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="text-muted-foreground line-clamp-2 text-pretty"
                      >
                        {post.excerpt ? (post.excerpt.length > 200 ? post.excerpt.substring(0, 200) + "..." : post.excerpt) : ""}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="text-sm text-muted-foreground"
                      >
                        By {post.profiles?.full_name || 
                             post.profiles?.username || 
                             (post.author_id ? "Author" : "Anonymous")}
                      </motion.div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-between pt-8 border-t"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPreviousPage || page === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </motion.div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} {totalPages > 1 && `of ${totalPages}`}
                  </span>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNextPage}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      </main>
      <footer className="border-t py-12">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Editorial. Built with precision.
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <BlogHeader />
        <main className="flex-1 container py-12 md:py-20">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </div>
            <div className="grid gap-12 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
