'use client'

interface EditorPreviewProps {
  title: string
  content: string
  excerpt: string
}

export function EditorPreview({ title, content, excerpt }: EditorPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{title || 'Your Title Here'}</h3>
        <p className="text-muted-foreground mb-4">{excerpt || 'Your excerpt will appear here...'}</p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div 
          className="text-foreground leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ 
            __html: content || '<p class="text-muted-foreground">Start writing to see a preview...</p>' 
          }}
        />
      </div>
    </div>
  )
}
