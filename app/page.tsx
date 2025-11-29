"use client"

import { useState } from "react"
import { Editor } from "@/components/editor/editor"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SocialGenerator } from "@/components/social/social-generator"
import { ExportMenu } from "@/components/export-menu"
import { Menu } from "lucide-react"
import { useEffect } from "react"
import { loadPost, savePost } from "@/lib/db"

export default function Home() {
  const [content, setContent] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    loadPost().then((saved) => {
      if (saved) setContent(saved)
    })
  }, [])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    savePost(newContent)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r bg-sidebar overflow-hidden flex flex-col`}>
        <Sidebar
          onStreamUpdate={(text) => setContent(text)}
          onStreamStart={() => { }}
          onStreamEnd={() => { }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 border-b flex items-center px-4 justify-between bg-background z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">BlogFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu content={content} />
            <SocialGenerator blogContent={content} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          <Editor content={content} onChange={handleContentChange} />
        </main>
      </div>
    </div>
  )
}
