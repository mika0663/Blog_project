import { BlogHeader } from "@/components/blog-header"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  // Fetch post counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_published", true)
      
      return {
        ...category,
        postCount: count || 0,
      }
    })
  )

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Explore by Category</h1>
            <p className="text-muted-foreground text-lg text-pretty">
              Discover stories across different genres and topics that interest you.
            </p>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            {categoriesWithCounts?.map((category) => {
              const postCount = category.postCount || 0

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-primary"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-serif text-2xl font-bold group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      <Badge variant="secondary" className="shrink-0">
                        {postCount} {postCount === 1 ? "story" : "stories"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm text-pretty">{category.description}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
