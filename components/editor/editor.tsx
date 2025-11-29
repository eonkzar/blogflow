"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface EditorProps {
    content: string
    onChange: (content: string) => void
}

export function Editor({ content, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your amazing blog post...',
            }),
        ],
        immediatelyRender: false,
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Update editor content if content prop changes externally (e.g. from AI)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if the content is different to avoid cursor jumping
            // This is a simple check; for production might need more robust diffing
            // or only update if editor is empty/not focused.
            // For streaming, we might need a different approach, but let's start here.
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 border rounded-lg shadow-sm bg-card">
            <EditorContent editor={editor} />
        </div>
    )
}
