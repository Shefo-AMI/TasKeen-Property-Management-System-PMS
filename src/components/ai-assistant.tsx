import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { 
  Bot, User, Send, X, Calendar, Bell, FileText, Users,
  Home, Wrench, DollarSign, MessageSquare, Lightbulb,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIAssistantProps {
  user: User
  onClose: () => void
  onScheduleTask: (task: string) => void
}

export function AIAssistant({ user, onClose, onScheduleTask }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello ${user.fullName}! I'm your PropertyFlow AI Assistant. I can help you with:

• Managing properties and tenants
• Scheduling maintenance requests
• Setting up payment reminders
• Generating reports and insights
• Answering questions about the platform

How can I assist you today?`,
      timestamp: new Date(),
      suggestions: [
        'Schedule a property inspection',
        'Set up rent reminders',
        'Generate monthly report',
        'Find overdue payments',
        'Create maintenance task'
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: Calendar, label: 'Schedule Task', action: 'schedule' },
    { icon: Bell, label: 'Set Reminder', action: 'reminder' },
    { icon: FileText, label: 'Generate Report', action: 'report' },
    { icon: Users, label: 'Tenant Info', action: 'tenant' },
    { icon: Home, label: 'Property Status', action: 'property' },
    { icon: Wrench, label: 'Maintenance', action: 'maintenance' }
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(inputMessage)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes('schedule') || lowerInput.includes('task')) {
      return {
        content: `I can help you schedule tasks! Here are some options:

• Property inspections
• Maintenance appointments  
• Tenant meetings
• Lease renewals
• Payment follow-ups

What would you like to schedule?`,
        suggestions: [
          'Schedule property inspection',
          'Set maintenance appointment',
          'Plan tenant meeting',
          'Schedule lease renewal'
        ]
      }
    }

    if (lowerInput.includes('reminder') || lowerInput.includes('payment')) {
      return {
        content: `I can set up various reminders for you:

• Rent payment reminders
• Lease expiration alerts (15 days before)
• Maintenance follow-ups
• Property inspection schedules
• Tenant communication reminders

Which type of reminder would you like to create?`,
        suggestions: [
          'Set rent payment reminder',
          'Create lease expiry alert',
          'Schedule maintenance reminder',
          'Set inspection reminder'
        ]
      }
    }

    if (lowerInput.includes('report') || lowerInput.includes('analytics')) {
      return {
        content: `I can help generate various reports:

• Monthly revenue report
• Property occupancy analysis
• Maintenance request summary
• Tenant payment history
• Property performance metrics

What type of report do you need?`,
        suggestions: [
          'Monthly revenue report',
          'Occupancy analysis',
          'Maintenance summary',
          'Payment history report'
        ]
      }
    }

    if (lowerInput.includes('tenant') || lowerInput.includes('lease')) {
      return {
        content: `I can assist with tenant management:

• Finding tenant information
• Checking lease details
• Reviewing payment history
• Scheduling tenant communications
• Processing lease renewals

What tenant information do you need?`,
        suggestions: [
          'Find tenant details',
          'Check lease status',
          'Review payment history',
          'Schedule tenant call'
        ]
      }
    }

    if (lowerInput.includes('maintenance') || lowerInput.includes('repair')) {
      return {
        content: `Here's how I can help with maintenance:

• Creating maintenance requests
• Tracking repair progress
• Scheduling contractor visits
• Managing maintenance costs
• Prioritizing urgent issues

What maintenance task can I help with?`,
        suggestions: [
          'Create maintenance request',
          'Track repair status',
          'Schedule contractor',
          'Review maintenance costs'
        ]
      }
    }

    if (lowerInput.includes('property') || lowerInput.includes('building')) {
      return {
        content: `I can provide property insights:

• Property performance metrics
• Occupancy rates and trends
• Maintenance cost analysis
• Revenue per property
• Market comparison data

What property information would you like?`,
        suggestions: [
          'Property performance',
          'Occupancy trends',
          'Maintenance costs',
          'Revenue analysis'
        ]
      }
    }

    // Default response
    return {
      content: `I understand you're looking for help with "${input}". Here are some things I can assist you with:

• **Property Management**: View and manage your property portfolio
• **Tenant Services**: Handle tenant information and communications
• **Maintenance**: Track and schedule maintenance requests
• **Financial**: Monitor payments, rent collection, and reporting
• **Scheduling**: Set up tasks, reminders, and appointments

Please let me know specifically what you'd like to do, and I'll guide you through it!`,
      suggestions: [
        'Show me property overview',
        'Help with maintenance',
        'Set up reminders',
        'Generate reports'
      ]
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const handleQuickAction = (action: string) => {
    let message = ''
    switch (action) {
      case 'schedule':
        message = 'I want to schedule a task'
        break
      case 'reminder':
        message = 'Help me set up reminders'
        break
      case 'report':
        message = 'Generate a report for me'
        break
      case 'tenant':
        message = 'I need tenant information'
        break
      case 'property':
        message = 'Show me property status'
        break
      case 'maintenance':
        message = 'Help with maintenance requests'
        break
      default:
        message = 'How can you help me?'
    }
    setInputMessage(message)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle>PropertyFlow AI Assistant</DialogTitle>
                <DialogDescription>
                  Your intelligent property management helper
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleQuickAction(action.action)}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 px-6"
        >
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[85%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.type === 'assistant' && (
                  <div className="ml-10 space-y-1">
                    <p className="text-xs text-gray-500">Try asking:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 pt-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about property management..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              AI Assistant • Always available to help
            </p>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
