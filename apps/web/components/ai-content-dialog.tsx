'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react'

interface AIContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTitle: string
  currentContent: string
  onInsertContent: (content: string) => void
  onReplaceTitle: (title: string) => void
}

type ContentType = 'title' | 'introduction' | 'outline' | 'expand' | 'improve' | 'conclusion'

const contentTypes = [
  {
    id: 'title' as ContentType,
    name: 'Generate Title',
    description: 'Create engaging titles based on your content',
    icon: '✨',
  },
  {
    id: 'introduction' as ContentType,
    name: 'Write Introduction',
    description: 'Generate compelling opening paragraphs',
    icon: '🚀',
  },
  {
    id: 'outline' as ContentType,
    name: 'Create Outline',
    description: 'Structure your article with key points',
    icon: '📋',
  },
  {
    id: 'expand' as ContentType,
    name: 'Expand Content',
    description: 'Add more detail to existing sections',
    icon: '📝',
  },
  {
    id: 'improve' as ContentType,
    name: 'Improve Writing',
    description: 'Enhance clarity and engagement',
    icon: '✏️',
  },
  {
    id: 'conclusion' as ContentType,
    name: 'Write Conclusion',
    description: 'Create strong closing paragraphs',
    icon: '🎯',
  },
]

// Mock AI generation functions
const generateAIContent = async (
  type: ContentType,
  prompt: string,
  context: { title: string; content: string },
) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000))

  const responses = {
    title: [
      'The Ultimate Guide to Modern Content Creation',
      '10 Proven Strategies That Will Transform Your Writing',
      'Why Every Creator Needs to Master This Essential Skill',
      'The Secret to Creating Content That Actually Converts',
      'From Beginner to Expert: Your Complete Content Journey',
    ],
    introduction: `In today's digital landscape, creating compelling content has become more crucial than ever. Whether you're a seasoned writer or just starting your journey, understanding the fundamentals of effective content creation can make the difference between content that gets ignored and content that drives real engagement.

This comprehensive guide will walk you through proven strategies, practical techniques, and insider tips that successful creators use to captivate their audiences and achieve their goals.`,
    outline: `## Article Outline

### 1. Introduction
- Hook the reader with a compelling opening
- Establish the problem or opportunity
- Preview what they'll learn

### 2. Understanding Your Audience
- Identifying your target readers
- Research methods and tools
- Creating reader personas

### 3. Content Planning and Strategy
- Setting clear objectives
- Content calendar development
- Topic research and validation

### 4. Writing Techniques That Work
- Crafting compelling headlines
- Structuring for readability
- Using storytelling elements

### 5. Optimization and Distribution
- SEO best practices
- Platform-specific formatting
- Promotion strategies

### 6. Measuring Success
- Key metrics to track
- Analytics tools and setup
- Iterating based on data

### 7. Conclusion
- Recap key takeaways
- Next steps for readers
- Call to action`,
    expand: `Building on this foundation, it's important to understand that successful content creation isn't just about writing well—it's about understanding your audience deeply and delivering value that resonates with their specific needs and challenges.

Consider the psychology behind why people consume content. They're looking for solutions, entertainment, education, or inspiration. Your role as a content creator is to identify which of these needs you're addressing and then craft your message accordingly.

Research shows that the most engaging content often combines multiple elements: storytelling to create emotional connection, data to build credibility, and actionable insights that readers can immediately apply. This multi-layered approach ensures your content serves both immediate and long-term value.`,
    improve: `Here's an enhanced version of your content with improved clarity and engagement:

Your original content has great potential, but we can make it even more compelling by adding specific examples, stronger transitions, and more engaging language. Consider breaking up longer paragraphs, using more active voice, and incorporating questions that directly address your reader's concerns.

The key is to write as if you're having a conversation with a friend who's genuinely interested in learning from you. This approach naturally creates more engaging, relatable content that readers want to finish.`,
    conclusion: `As we've explored throughout this guide, effective content creation is both an art and a science. It requires creativity to engage your audience, strategy to achieve your goals, and consistency to build lasting relationships with your readers.

The most important takeaway is this: start where you are, use what you have, and focus on providing genuine value to your audience. Every expert was once a beginner, and every piece of great content started with a single word.

Your content creation journey begins now. Take the strategies we've discussed, adapt them to your unique voice and goals, and start creating content that makes a real difference in your readers' lives.

Ready to transform your content? Start with one technique from this guide and implement it in your next piece. Your audience is waiting for the value only you can provide.`,
  }

  if (type === 'title') {
    return responses.title[Math.floor(Math.random() * responses.title.length)]
  }

  return responses[type] || 'Generated content would appear here based on your prompt and context.'
}

export function AIContentDialog({
  open,
  onOpenChange,
  currentTitle,
  currentContent,
  onInsertContent,
  onReplaceTitle,
}: AIContentDialogProps) {
  const [selectedType, setSelectedType] = useState<ContentType>('title')
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim() && selectedType !== 'title') return

    setIsGenerating(true)
    try {
      const content = await generateAIContent(selectedType, prompt, {
        title: currentTitle,
        content: currentContent,
      })
      setGeneratedContent(content)
    } catch (error) {
      console.error('AI generation error:', error)
      setGeneratedContent('Sorry, there was an error generating content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedContent) return

    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleInsert = () => {
    if (selectedType === 'title') {
      onReplaceTitle(generatedContent)
    } else {
      onInsertContent(generatedContent)
    }
    onOpenChange(false)
    setGeneratedContent('')
    setPrompt('')
  }

  const selectedTypeInfo = contentTypes.find((t) => t.id === selectedType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            AI Content Generator
          </DialogTitle>
          <DialogDescription>
            Choose a content type and let AI help you create engaging content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            <div>
              <Label className="mb-4 block text-base font-medium">Content Type</Label>
              <RadioGroup
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as ContentType)}
              >
                <div className="grid grid-cols-1 gap-3">
                  {contentTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label
                        htmlFor={type.id}
                        className="border-border hover:bg-muted/50 flex-1 cursor-pointer rounded-lg border p-3 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{type.icon}</span>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-muted-foreground text-sm">{type.description}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {selectedType !== 'title' && (
              <div>
                <Label htmlFor="prompt" className="text-base font-medium">
                  Additional Instructions
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={`Describe what you want for your ${selectedTypeInfo?.name.toLowerCase()}...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt.trim() && selectedType !== 'title')}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {selectedTypeInfo?.name}
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Generated Content */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Generated Content</Label>

            {generatedContent ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {selectedTypeInfo?.name} Result
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>

                  <div className="mt-4 flex gap-2 border-t pt-4">
                    <Button onClick={handleInsert} className="flex-1">
                      {selectedType === 'title' ? 'Replace Title' : 'Insert Content'}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-64">
                <CardContent className="flex h-full items-center justify-center">
                  <div className="text-muted-foreground text-center">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Generated content will appear here</p>
                    <p className="text-sm">Select a type and click generate to start</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
