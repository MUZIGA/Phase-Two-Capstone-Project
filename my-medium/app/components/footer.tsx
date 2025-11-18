import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          <div>
            <h3 className="font-bold text-foreground mb-4">WriteHub</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="font-bold text-foreground mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-foreground transition">
                  Latest Stories
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-muted-foreground hover:text-foreground transition">
                  Tags
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="font-bold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="font-bold text-foreground mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="text-muted-foreground hover:text-foreground transition">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                   className="text-muted-foreground hover:text-foreground transition">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; {currentYear} WriteHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
