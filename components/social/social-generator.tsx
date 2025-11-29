"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Copy, Check, Loader2 } from "lucide-react"
// import { generateSocialThreads } from "@/lib/ai" // Removed direct import
import { DEMO_SOCIAL_THREADS } from "@/lib/demo"

interface SocialPost {
    platform: "Twitter" | "LinkedIn" | "Instagram"
    type: string
    text: string
    suggested_hashtags: string[]
    emoji_strategy: string
    call_to_action: string
}

interface SocialGeneratorProps {
    blogContent: string
}

export function SocialGenerator({ blogContent }: SocialGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [posts, setPosts] = useState<SocialPost[]>([])
    const [rawJson, setRawJson] = useState("")

    const handleGenerate = async () => {
        const apiKey = localStorage.getItem("blogflow_gemini_key")

        if (!blogContent || blogContent.length < 50) {
            alert("Please write some content first!")
            return
        }

        setIsGenerating(true)
        setPosts([])
        setRawJson("")

        try {
            if (!apiKey) {
                // Demo Mode
                await new Promise(r => setTimeout(r, 2000)) // Simulate processing
                setPosts(DEMO_SOCIAL_THREADS as SocialPost[])
            } else {
                // Real API Mode (Server-Side)
                const response = await fetch('/api/social', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: blogContent, apiKey })
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || response.statusText)
                }

                if (!response.body) throw new Error("No response body")

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let accumulated = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    accumulated += chunk
                    setRawJson(accumulated)
                }

                // Try to parse the final JSON
                try {
                    const start = accumulated.indexOf('[')
                    const end = accumulated.lastIndexOf(']')
                    if (start !== -1 && end !== -1) {
                        const jsonStr = accumulated.substring(start, end + 1)
                        const parsed = JSON.parse(jsonStr)
                        setPosts(parsed)
                    } else {
                        console.error("Could not find JSON array in response")
                    }
                } catch (e) {
                    console.error("Failed to parse JSON", e)
                }
            }

        } catch (error) {
            console.error("Social generation failed", error)
            alert("Failed to generate social posts.")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // Could add toast here
    }

    const postsByPlatform = (platform: string) => posts.filter(p => p.platform === platform)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Break into Social Threads
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Social Media Threads</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {!isGenerating && posts.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <p className="text-muted-foreground text-center max-w-md">
                                Ready to turn your blog post into engaging social media content?
                                Click generate to create optimized threads for Twitter, LinkedIn, and Instagram.
                            </p>
                            <Button onClick={handleGenerate} size="lg">
                                Generate Social Posts
                            </Button>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Analyzing content and crafting threads...</p>
                            <div className="text-xs text-muted-foreground max-w-lg truncate px-4 font-mono bg-muted p-2 rounded">
                                {rawJson.slice(-100)}
                            </div>
                        </div>
                    )}

                    {!isGenerating && posts.length > 0 && (
                        <Tabs defaultValue="Twitter" className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList>
                                    <TabsTrigger value="Twitter">Twitter / X</TabsTrigger>
                                    <TabsTrigger value="LinkedIn">LinkedIn</TabsTrigger>
                                    <TabsTrigger value="Instagram">Instagram</TabsTrigger>
                                </TabsList>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(posts, null, 2))}>
                                    Copy All JSON
                                </Button>
                            </div>

                            {["Twitter", "LinkedIn", "Instagram"].map((platform) => (
                                <TabsContent key={platform} value={platform} className="flex-1 overflow-hidden mt-0">
                                    <ScrollArea className="h-full pr-4">
                                        <div className="grid gap-4 pb-4">
                                            {postsByPlatform(platform).map((post, i) => (
                                                <Card key={i}>
                                                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline">{post.type}</Badge>
                                                            <Badge variant="secondary" className="font-normal text-xs">
                                                                {post.text.length} chars
                                                            </Badge>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(post.text)}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <p className="whitespace-pre-wrap text-sm">{post.text}</p>
                                                        {post.suggested_hashtags && (
                                                            <p className="text-xs text-blue-500">
                                                                {post.suggested_hashtags.join(" ")}
                                                            </p>
                                                        )}
                                                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                                            <strong>Strategy:</strong> {post.emoji_strategy}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
