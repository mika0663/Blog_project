"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PenSquare } from "lucide-react"
import Link from "next/link"
import { PostActions } from "@/components/post-actions"
import { motion } from "framer-motion"

interface Post {
  id: string
  title: string
  slug: string
  is_published: boolean
  created_at: string
  author_id: string
  categories?: { name: string } | null
}

interface DashboardClientProps {
  posts: Post[]
}

export function DashboardClient({ posts }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Your Stories</h1>
          <p className="text-muted-foreground">Manage and publish your editorial content.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild>
            <Link href="/protected/new">
              <PenSquare className="mr-2 h-4 w-4" /> New Story
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-md border"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post, index) => (
              <TableRow
                key={post.id}
                className="border-b transition-colors hover:bg-muted/50"
                asChild
              >
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.is_published ? "default" : "secondary"}>
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(post.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <PostActions
                      postId={post.id}
                      postSlug={post.slug}
                      authorId={post.author_id}
                    />
                  </TableCell>
                </motion.tr>
              </TableRow>
            ))}
            {!posts?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                  No stories found. Start writing your first masterpiece.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}

