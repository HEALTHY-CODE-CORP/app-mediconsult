"use client"

import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

const TinyEditor = dynamic(
  async () => {
    const mod = await import("@tinymce/tinymce-react")
    return mod.Editor
  },
  {
    ssr: false,
    loading: () => (
      <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
        Cargando editor...
      </div>
    ),
  }
)

interface RichTextEditorProps {
  value: string
  onChange: (value: string, meta?: { hasFocus: boolean }) => void
  disabled?: boolean
  height?: number
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  height = 380,
  className,
}: RichTextEditorProps) {
  return (
    <div className={cn("rounded-md", className)}>
      <TinyEditor
        apiKey={TINYMCE_API_KEY || "no-api-key"}
        value={value}
        disabled={disabled}
        onEditorChange={(nextValue, editor) =>
          onChange(nextValue, { hasFocus: editor.hasFocus() })
        }
        init={{
          height,
          menubar: false,
          branding: false,
          statusbar: true,
          browser_spellcheck: true,
          contextmenu: false,
          plugins: [
            "autolink",
            "lists",
            "link",
            "table",
            "code",
            "wordcount",
            "searchreplace",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link table | removeformat | code",
          content_style:
            "body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; }",
        }}
      />
    </div>
  )
}
