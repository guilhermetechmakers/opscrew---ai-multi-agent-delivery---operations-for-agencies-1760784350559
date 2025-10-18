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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Editor Toolbar</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVariableMenuOpen(!isVariableMenuOpen)}
                className="flex items-center gap-2"
              >
                <Variable className="w-4 h-4" />
                Variables
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
                className="flex items-center gap-2"
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
        <Card className="animate-fade-in-down">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Template Variables</CardTitle>
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
                    />
                  )}
                  {variable.type === 'date' && (
                    <Input
                      id={variable.key}
                      type="date"
                      value={variableValues[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                      disabled={disabled}
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
                        className="pl-8"
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
                  className="flex items-center gap-2"
                  disabled={disabled}
                >
                  <Variable className="w-4 h-4" />
                  {variable.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleContentChange}
            className="min-h-[400px] p-4 focus:outline-none prose prose-invert max-w-none"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
            data-placeholder={placeholder}
          />
        </CardContent>
      </Card>

      {/* Preview */}
      {Object.keys(variableValues).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Preview with Variables</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div 
              className="prose prose-invert max-w-none p-4 bg-muted/20 rounded-lg"
              dangerouslySetInnerHTML={{ __html: resolveVariables(content) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}