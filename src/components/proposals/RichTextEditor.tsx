/**
 * Rich Text Editor component with variable support for proposals
 */

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Code,
  Type,
  Variable,
  Save,
  Undo,
  Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Variable {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'currency'
  placeholder?: string
  required?: boolean
}

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  variables?: Variable[]
  onVariablesChange?: (variables: Record<string, any>) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  variables = [],
  onVariablesChange,
  className,
  placeholder = "Start typing your proposal content...",
  disabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isVariableMenuOpen, setIsVariableMenuOpen] = useState(false)
  const [variableValues, setVariableValues] = useState<Record<string, any>>({})

  // Formatting functions
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [])

  const insertVariable = useCallback((variableKey: string) => {
    const placeholder = `{{${variableKey}}}`
    execCommand('insertText', placeholder)
    setIsVariableMenuOpen(false)
  }, [execCommand])

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }, [onChange])

  const handleVariableChange = useCallback((key: string, value: any) => {
    const newValues = { ...variableValues, [key]: value }
    setVariableValues(newValues)
    onVariablesChange?.(newValues)
  }, [variableValues, onVariablesChange])

  const resolveVariables = useCallback((text: string) => {
    let resolved = text
    Object.entries(variableValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      resolved = resolved.replace(new RegExp(placeholder, 'g'), String(value))
    })
    return resolved
  }, [variableValues])

  const toolbarButtons = [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { command: 'formatBlock', value: 'blockquote', icon: Quote, label: 'Quote' },
    { command: 'createLink', icon: Link, label: 'Link' },
    { command: 'formatCode', icon: Code, label: 'Code' }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Editor Toolbar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVariableMenuOpen(!isVariableMenuOpen)}
                className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
              >
                <Variable className="w-4 h-4" />
                Variables
                {variables.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {variables.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {toolbarButtons.map((button) => (
              <Button
                key={button.command}
                variant="outline"
                size="sm"
                onClick={() => execCommand(button.command, button.value)}
                className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                disabled={disabled}
              >
                <button.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{button.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variable Panel */}
      {isVariableMenuOpen && variables.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Variable className="h-4 w-4" />
                Template Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variables.map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <Label htmlFor={variable.key} className="flex items-center gap-2">
                      {variable.label}
                      {variable.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </Label>
                    {variable.type === 'text' && (
                      <Input
                        id={variable.key}
                        value={variableValues[variable.key] || ''}
                        onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                        placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                        disabled={disabled}
                        className="focus:ring-primary/20"
                      />
                    )}
                    {variable.type === 'number' && (
                      <Input
                        id={variable.key}
                        type="number"
                        value={variableValues[variable.key] || ''}
                        onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                        placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                        disabled={disabled}
                        className="focus:ring-primary/20"
                      />
                    )}
                    {variable.type === 'date' && (
                      <Input
                        id={variable.key}
                        type="date"
                        value={variableValues[variable.key] || ''}
                        onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                        disabled={disabled}
                        className="focus:ring-primary/20"
                      />
                    )}
                    {variable.type === 'currency' && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id={variable.key}
                          type="number"
                          step="0.01"
                          value={variableValues[variable.key] || ''}
                          onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                          placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                          className="pl-8 focus:ring-primary/20"
                          disabled={disabled}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button
                    key={variable.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.key)}
                    className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    disabled={disabled}
                  >
                    <Variable className="w-4 h-4" />
                    {variable.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Editor */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleContentChange}
            className="min-h-[400px] p-6 focus:outline-none prose prose-invert max-w-none bg-card/50"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
            data-placeholder={placeholder}
          />
          <style jsx>{`
            [contenteditable]:empty:before {
              content: attr(data-placeholder);
              color: hsl(var(--muted-foreground));
              pointer-events: none;
            }
            [contenteditable]:focus {
              outline: none;
            }
            [contenteditable] h1, [contenteditable] h2, [contenteditable] h3 {
              color: hsl(var(--foreground));
              font-weight: 600;
            }
            [contenteditable] p {
              margin: 0.5rem 0;
              line-height: 1.6;
            }
            [contenteditable] ul, [contenteditable] ol {
              margin: 0.5rem 0;
              padding-left: 1.5rem;
            }
            [contenteditable] blockquote {
              border-left: 4px solid hsl(var(--primary));
              padding-left: 1rem;
              margin: 1rem 0;
              font-style: italic;
              color: hsl(var(--muted-foreground));
            }
            [contenteditable] code {
              background: hsl(var(--muted));
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
              font-family: 'Courier New', monospace;
              font-size: 0.875rem;
            }
          `}</style>
        </CardContent>
      </Card>

      {/* Preview */}
      {Object.keys(variableValues).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview with Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div 
                className="prose prose-invert max-w-none p-6 bg-card/50 rounded-lg border border-border/30"
                dangerouslySetInnerHTML={{ __html: resolveVariables(content) }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}