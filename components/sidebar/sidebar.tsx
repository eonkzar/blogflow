"use client"

import React, { useState } from "react" // Added React import
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Sparkles, Key } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
// import { generateBlogPost } from "@/lib/ai" // Removed direct import
import { DEMO_BLOG_POST } from "@/lib/demo" // Added import

interface SidebarProps {
    onStreamUpdate: (chunk: string) => void
    onStreamStart: () => void
    onStreamEnd: () => void
}

export function Sidebar({ onStreamUpdate, onStreamStart, onStreamEnd }: SidebarProps) {
    const [prompt, setPrompt] = useState("")
    const [apiKey, setApiKey] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    // Load API key from localStorage on mount
    React.useEffect(() => {
        const storedKey = localStorage.getItem("blogflow_gemini_key")
        if (storedKey) setApiKey(storedKey)
    }, [])

    const handleSaveKey = (key: string) => {
        setApiKey(key)
        localStorage.setItem("blogflow_gemini_key", key)
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        onStreamStart()

        try {
            if (!apiKey) {
                // Demo Mode
                const chunks = DEMO_BLOG_POST.match(/.{1,10}/g) || []
                let fullContent = ""
                for (const chunk of chunks) {
                    await new Promise(r => setTimeout(r, 30)) // Simulate network delay
                    fullContent += chunk
                    onStreamUpdate(fullContent)
                }
            } else {
                // Real API Mode (Server-Side)
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, apiKey })
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || response.statusText)
                }

                if (!response.body) throw new Error("No response body")

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let fullContent = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    // The stream returns chunks formatted by AI SDK (0:"text")
                    // We need to parse this format or just use the raw text if it's simple text stream
                    // The toDataStreamResponse returns a specific format.
                    // Let's simplify and assume we get raw text chunks if we used streamText directly? 
                    // No, toDataStreamResponse sends protocol.
                    // We should use `readDataStream` from `ai` package on client if possible, 
                    // OR just manually parse if it's simple. 
                    // Actually, for simplicity let's just append the decoded text and clean it up if needed.
                    // Wait, `toDataStreamResponse` sends parts like `0:"chunk"\n`.
                    // We need to parse that.

                    const chunk = decoder.decode(value, { stream: true })
                    // Basic parsing for AI SDK stream format (very naive)
                    // Format is usually: 0:"text_chunk"\n
                    const lines = chunk.split('\n')
                    for (const line of lines) {
                        if (line.startsWith('0:')) {
                            try {
                                const text = JSON.parse(line.substring(2))
                                fullContent += text
                                onStreamUpdate(fullContent)
                            } catch (e) {
                                // ignore parse error for partial lines
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error("Generation failed", error)
            alert(`Generation failed: ${error.message || "Unknown error"}`)
        } finally {
            setIsGenerating(false)
            onStreamEnd()
        }
    }

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">AI Assistant</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Settings</DialogTitle>
                            <DialogDescription>
                                Configure your AI provider settings.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="apiKey">Gemini API Key</Label>
                                <div className="relative">
                                    <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="apiKey"
                                        type="password"
                                        placeholder="sk-..."
                                        className="pl-9"
                                        value={apiKey}
                                        onChange={(e) => handleSaveKey(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Your key is stored locally in your browser.</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            <div className="flex-1 flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label>Prompt</Label>
                    <Textarea
                        placeholder="Write a blog post about..."
                        className="h-32 resize-none"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                <Button
                    className="w-full gap-2"
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Draft"}
                </Button>
            </div>

            <div className="mt-auto">
                <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Be specific about tone and length</li>
                        <li>Mention target audience</li>
                        <li>Ask for specific headings</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
