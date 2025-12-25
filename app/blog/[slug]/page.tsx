"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@apollo/client/react"
import { GET_POST_BY_SLUG, GET_POST_BY_ID } from "@/lib/graphql/queries"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { BlogHeader } from "@/components/blog-header"
import { PostActions } from "@/components/post-actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)

  // Fetch user
  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    fetchUser()
  }, [supabase])

  // Fetch post using GraphQL
  const { data: postData, loading: postLoading, error: postError } = useQuery(GET_POST_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: "cache-and-network",
  })

  const post = postData?.postsCollection?.edges?.[0]?.node

  // Fetch category and profile when post is loaded
  useEffect(() => {
    async function fetchRelatedData() {
      if (!post) return

      // Fetch category
      if (post.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("name")
          .eq("id", post.category_id)
          .single()
        setCategory(categoryData)
      }

      // Fetch author profile
      if (post.author_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url, bio")
          .eq("id", post.author_id)
          .single()
        setProfile(profileData)
      }
    }
    fetchRelatedData()
  }, [post, supabase])

  if (postLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <BlogHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (postError || (!post && !postLoading)) {
    // Redirect to 404 or show error
    return (
      <div className="min-h-screen flex flex-col">
        <BlogHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
            <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const isAuthor = user && user.id === post.author_id

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <article className="flex-1 container py-20 max-w-3xl mx-auto space-y-12">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
              >
                {category?.name || "Uncategorized"}
              </motion.p>
              {isAuthor && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <PostActions
                    postId={post.id}
                    postSlug={post.slug}
                    authorId={post.author_id}
                  />
                </motion.div>
              )}
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-balance leading-[1.1]"
            >
              {post.title}
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">{profile?.full_name || profile?.username || "Anonymous"}</span>
            <span>•</span>
            <span>{post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : "Draft"}</span>
          </motion.div>
        </motion.header>

        {post.cover_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="aspect-[21/9] overflow-hidden rounded-xl bg-muted"
          >
            <motion.img
              src={post.cover_image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed text-foreground/90 selection:bg-primary/10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pt-20 border-t"
        >
          <div className="flex items-start gap-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-full bg-muted overflow-hidden shrink-0"
            >
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.full_name || "Author"}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{profile?.full_name || profile?.username || "Anonymous"}</h3>
              <p className="text-muted-foreground text-sm max-w-md">{profile?.bio || ""}</p>
            </div>
          </div>
        </motion.footer>
      </article>
      <footer className="border-t py-12 mt-20">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Editorial. Built with precision.
        </div>
      </footer>
    </div>
  )
}
