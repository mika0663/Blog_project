"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditStoryPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    category_id: "",
    is_published: false,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true })
        if (categoriesData) setCategories(categoriesData)

        // Fetch post
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: post, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .eq("author_id", user.id)
          .single()

        if (error || !post) {
          toast.error("Post not found or you don't have permission to edit it")
          router.push("/protected")
          return
        }

        setFormData({
          title: post.title || "",
          slug: post.slug || "",
          content: post.content || "",
          excerpt: post.excerpt || "",
          cover_image: post.cover_image || "",
          category_id: post.category_id || "",
          is_published: post.is_published || false,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load post")
        router.push("/protected")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get current post to check if it was already published
      const { data: currentPost } = await supabase
        .from("posts")
        .select("published_at, is_published")
        .eq("slug", slug)
        .single()

      const postData = {
        ...formData,
        published_at: formData.is_published && !currentPost?.published_at 
          ? new Date().toISOString() 
          : currentPost?.published_at || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("posts")
        .update(postData)
        .eq("slug", slug)
        .eq("author_id", user.id)

      if (error) throw error

      toast.success("Story updated successfully")
      router.push("/protected")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating post:", error)
      toast.error(error.message || "Failed to update story. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/protected">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Edit Story</h1>
          <p className="text-muted-foreground">Update your story content and settings.</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-8 max-w-3xl"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter your story title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="auto-generated-from-title"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">URL-friendly version of the title</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            placeholder="A brief summary of your story..."
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your story here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={15}
            required
            className="font-serif"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_image">Cover Image URL</Label>
          <Input
            id="cover_image"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Switch
            id="is_published"
            checked={formData.is_published}
            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
          />
          <div className="flex-1">
            <Label htmlFor="is_published" className="cursor-pointer">
              Publish immediately
            </Label>
            <p className="text-xs text-muted-foreground">Make this story visible to readers</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formData.is_published ? "Update & Publish" : "Save Changes"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      </motion.form>
    </div>
  )
}

