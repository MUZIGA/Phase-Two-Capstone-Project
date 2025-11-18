'use client'

import { useState, useRef } from 'react'
import { Button } from '../components/ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false)

  
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertHeading = (level: number) => {
    applyFormat('formatBlock', `<h${level}>`)
    setIsFormatMenuOpen(false)
  }

  
  const insertList = (ordered: boolean) => {
    applyFormat(ordered ? 'insertOrderedList' : 'insertUnorderedList')
    setIsFormatMenuOpen(false)
  }

  return (
    <div className="space-y-2">
      
      <div className="flex flex-wrap gap-2 p-3 bg-card border border-input rounded-t-md">
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('bold')}
          title="Bold (Ctrl+B)"
          className="text-xs"
        >
          <span className="font-bold">B</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('italic')}
          title="Italic (Ctrl+I)"
          className="text-xs"
        >
          <span className="italic">I</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('underline')}
          title="Underline (Ctrl+U)"
          className="text-xs"
        >
          <span className="underline">U</span>
        </Button>

        
        <div className="w-px bg-border" />

    
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsFormatMenuOpen(!isFormatMenuOpen)}
            className="text-xs"
          >
            Format ▼
          </Button>

          {isFormatMenuOpen && (
            <div className="absolute top-full mt-1 bg-card border border-input rounded shadow-lg z-10">
              <button
                type="button"
                onClick={() => insertHeading(1)}
                className="block w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold"
              >
                Heading 1
              </button>
              <button
                type="button"
                onClick={() => insertHeading(2)}
                className="block w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold"
              >
                Heading 2
              </button>
              <button
                type="button"
                onClick={() => insertHeading(3)}
                className="block w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold"
              >
                Heading 3
              </button>
              <div className="border-t border-input" />
              <button
                type="button"
                onClick={() => insertList(false)}
                className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
              >
                Bullet List
              </button>
              <button
                type="button"
                onClick={() => insertList(true)}
                className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
              >
                Numbered List
              </button>
            </div>
          )}
        </div>

        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('insertUnorderedList')}
          title="Bullet List"
          className="text-xs"
        >
          • List
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('createLink', prompt('Enter URL:') || '')}
          title="Insert Link"
          className="text-xs"
        >
          Link
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('formatBlock', '<blockquote>')}
          title="Block Quote"
          className="text-xs"
        >
          {""}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyFormat('formatBlock', '<pre>')}
          title="Code Block"
          className="text-xs font-mono"
        >
          {"<>"}
        </Button>
      </div>

      
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-96 p-4 bg-background border border-input rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        style={{ 
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      >
        {!value && <span className="text-muted-foreground">{placeholder}</span>}
      </div>

      
      <div className="text-xs text-muted-foreground text-right">
        {value.replace(/<[^>]*>/g, '').length} characters
      </div>
    </div>
  )
}
