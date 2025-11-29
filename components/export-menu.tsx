"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileCode, FileType } from "lucide-react"

interface ExportMenuProps {
    content: string
}

export function ExportMenu({ content }: ExportMenuProps) {
    const handleExport = (type: 'html' | 'markdown') => {
        if (!content) return

        let blob: Blob
        let filename: string

        if (type === 'html') {
            blob = new Blob([content], { type: 'text/html' })
            filename = 'blog-post.html'
        } else {
            // Simple HTML to Markdown conversion (very basic)
            // For a real app, use turndown or similar
            // Here we just dump the HTML for now or strip tags if we want text
            // Let's just save as .md but keep HTML inside since Markdown supports HTML
            // Or we can try a regex replace for basic tags
            let md = content
                .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
                .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
                .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
                .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                .replace(/<em>(.*?)<\/em>/g, '*$1*')
                .replace(/<ul>/g, '')
                .replace(/<\/ul>/g, '')
                .replace(/<li>(.*?)<\/li>/g, '- $1\n')
                .replace(/<[^>]*>/g, '') // Strip remaining tags

            blob = new Blob([md], { type: 'text/markdown' })
            filename = 'blog-post.md'
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('markdown')}>
                    <FileType className="mr-2 h-4 w-4" />
                    Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    HTML (.html)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
