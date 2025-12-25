import { BlogHeader } from "@/components/blog-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <section className="space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">About Editorial</h1>
            <p className="text-muted-foreground text-lg text-pretty leading-relaxed">
              Editorial is a platform dedicated to thoughtful storytelling, exploring the intersection of design, 
              code, and editorial thinking. We believe in the power of well-crafted narratives and the impact 
              they can have on how we understand the world around us.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Our Mission</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                At Editorial, we're committed to creating a space where ideas can flourish. We publish 
                articles that challenge conventional thinking, celebrate creativity, and provide deep dives 
                into topics that matter.
              </p>
              <p>
                Whether you're interested in the latest developments in technology, the nuances of design 
                thinking, or the art of storytelling itself, you'll find something here that resonates.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold tracking-tight">What We Cover</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Design</h3>
                <p className="text-muted-foreground">
                  Exploring visual communication, user experience, and the principles that make great design 
                  work. From typography to color theory, we dive deep into what makes design effective.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Code</h3>
                <p className="text-muted-foreground">
                  Technical deep dives, programming insights, and discussions about the tools and technologies 
                  shaping the digital landscape. We believe code is a form of expression and communication.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Editorial Thinking</h3>
                <p className="text-muted-foreground">
                  The craft of writing, editing, and curating content. We explore how stories are structured, 
                  how narratives evolve, and how editorial decisions shape the way information is presented 
                  and consumed.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Join Us</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Editorial is built by a community of writers, designers, and thinkers who are passionate 
                about sharing their knowledge and perspectives. If you have a story to tell or an idea to explore, 
                we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/categories">Explore Categories</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold tracking-tight">Contact</h2>
              <p className="text-muted-foreground">
                Have questions or feedback? We're always interested in hearing from our readers. 
                Reach out through our platform or connect with us on social media.
              </p>
            </div>
          </section>
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

