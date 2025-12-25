import { BlogHeader } from "@/components/blog-header"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { CategoryPageClient } from "./category-client"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch posts in this category
  // Try with relationship syntax first
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id(full_name),
      categories:category_id(name, slug)
    `)
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  // If relationship syntax fails, fetch separately
  let postsWithRelations = posts || []
  
  if (postsError || !posts) {
    // Fallback: fetch posts without relationships
    const { data: simplePosts } = await supabase
      .from("posts")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
    
    if (simplePosts && simplePosts.length > 0) {
      // Fetch profiles separately
      const authorIds = [...new Set(simplePosts.map((p: any) => p.author_id).filter(Boolean))]
      const { data: profiles } = authorIds.length > 0 
        ? await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", authorIds)
        : { data: [] }
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
      
      postsWithRelations = simplePosts.map((post: any) => ({
        ...post,
        profiles: profileMap.get(post.author_id) || null,
        categories: category,
      }))
    }
  } else if (posts && posts.length > 0) {
    // Transform the relationship data if it came through
    postsWithRelations = posts.map((post: any) => ({
      ...post,
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : (post.profiles || null),
      categories: Array.isArray(post.categories) ? post.categories[0] : (post.categories || category),
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <CategoryPageClient
        category={category}
        posts={postsWithRelations?.map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          cover_image: post.cover_image,
          published_at: post.published_at,
          profiles: post.profiles,
        })) || []}
      />
    </div>
  )
}
