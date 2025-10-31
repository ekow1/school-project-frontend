import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ENV } from '../config/env'

export interface ChatMessage {
  id: string
  backendId?: string // Add backend ID for API calls
  text: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
  likeCount?: number
  dislikeCount?: number
  userFeedback?: 'like' | 'dislike' | null
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  category: "safety" | "emergency" | "general"
  messages?: ChatMessage[]
}

interface ChatState {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: ChatMessage[]
  isInSession: boolean
  isLoading: boolean
  error: string | null
  newMessageIds: Set<string> // Track new messages for typewriter effect
  likeCounts: Map<string, number> // Track like counts per message
  
  // Actions
  setSessions: (sessions: ChatSession[]) => void
  setCurrentSession: (session: ChatSession | null) => void
  setMessages: (messages: ChatMessage[]) => void
  setIsInSession: (isInSession: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNewMessageId: (messageId: string) => void
  clearNewMessageIds: () => void
  
  // API Actions
  fetchSessions: () => Promise<void>
  createSession: (text: string) => Promise<void>
  addMessage: (sessionId: string, text: string) => Promise<void>
  fetchSession: (sessionId: string) => Promise<void>
  
  // UI Actions
  startNewSession: (initialMessage?: string) => void
  openSession: (session: ChatSession) => void
  goBack: () => void
  deleteSession: (sessionId: string) => Promise<void>
  resendMessage: (sessionId: string, messageId: string) => Promise<void>
  deleteMessage: (messageId: string) => void
  editMessage: (messageId: string, newText: string) => void
  copyMessage: (messageId: string) => Promise<void>
  toggleLike: (messageId: string) => void
  updatePrompt: (sessionId: string, messageId: string, newPrompt: string) => Promise<void>
  likeMessage: (sessionId: string, messageId: string, action: 'like' | 'dislike') => Promise<void>
  updateSessionTitle: (sessionId: string) => Promise<void>
}

// API Configuration - Use your computer's IP address for React Native
const API_BASE_URL = ENV.CHAT_API_URL
const FALLBACK_API_URL = 'http://localhost:8000/api' // Fallback for web/development

// Helper function to get the correct API URL based on platform
const getApiUrl = () => {
  // In React Native, use the IP address; in web, use localhost
  return API_BASE_URL
}

// Mock responses for development/testing
const MOCK_RESPONSES = {
  "What are basic fire safety rules?": "Here are the basic fire safety rules:\n\n1. **Install smoke detectors** in every room and test them monthly\n2. **Keep fire extinguishers** accessible and know how to use them\n3. **Never leave cooking unattended** - most fires start in the kitchen\n4. **Keep flammable materials away** from heat sources\n5. **Have an escape plan** and practice it with your family\n6. **Stop, Drop, and Roll** if your clothes catch fire\n7. **Call emergency services** immediately if a fire breaks out\n8. **Keep exits clear** and accessible at all times",
  
  "How do I use a fire extinguisher?": "To use a fire extinguisher, remember the acronym **PASS**:\n\n1. **Pull** the pin to break the tamper seal\n2. **Aim** the nozzle at the base of the fire (not the flames)\n3. **Squeeze** the handle to release the extinguishing agent\n4. **Sweep** from side to side at the base of the fire\n\n**Important**: Only use a fire extinguisher if the fire is small and contained. If the fire is spreading or you feel unsafe, evacuate immediately and call emergency services.",
  
  "What to do in a fire emergency?": "In a fire emergency, follow these steps:\n\n1. **Alert others** and sound the alarm\n2. **Evacuate immediately** - don't stop for belongings\n3. **Stay low** to avoid smoke inhalation\n4. **Use the nearest exit** - never use elevators\n5. **Close doors** behind you to slow the fire\n6. **Go to your meeting place** outside\n7. **Call 911** from a safe location\n8. **Never go back** into a burning building\n\nIf trapped, close doors, seal gaps with wet cloths, and signal for help from a window.",
  
  "How to prevent kitchen fires?": "To prevent kitchen fires:\n\n1. **Never leave cooking unattended** - stay in the kitchen while cooking\n2. **Keep flammable items away** from the stove (towels, paper, curtains)\n3. **Clean grease buildup** regularly from stovetops and ovens\n4. **Use a timer** to remind you when food is cooking\n5. **Keep a lid nearby** to smother small grease fires\n6. **Turn pot handles inward** to prevent accidental spills\n7. **Wear short sleeves** or roll up long sleeves when cooking\n8. **Keep children away** from cooking areas\n9. **Install a fire extinguisher** in or near the kitchen\n10. **Test smoke alarms** monthly"
}

// Helper function to get mock response
const getMockResponse = (text: string): string => {
  const lowerText = text.toLowerCase()
  
  // Check for exact matches first
  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lowerText.includes(key.toLowerCase())) {
      return response
    }
  }
  
  // Default response for other queries
  return "I'm here to help with fire safety questions! I can provide information about:\n\n• Basic fire safety rules\n• How to use fire extinguishers\n• Emergency procedures\n• Kitchen fire prevention\n• General fire safety tips\n\nPlease ask me a specific question about fire safety, and I'll do my best to help you stay safe!"
}

// Helper function to generate unique message IDs
const generateMessageId = (baseId: string | undefined, type: 'user' | 'ai', index: number) => {
  const safeBaseId = baseId || `msg-${Date.now()}-${index}`
  return `${safeBaseId}-${type}`
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      messages: [],
      isInSession: false,
      isLoading: false,
      error: null,
      newMessageIds: new Set<string>(),
      likeCounts: new Map<string, number>(),

      setSessions: (sessions) => set({ sessions }),
      setCurrentSession: (session) => set({ currentSession: session }),
      setMessages: (messages) => set({ messages }),
      setIsInSession: (isInSession) => set({ isInSession }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      addNewMessageId: (messageId) => set(state => {
        const newSet = new Set<string>()
        state.newMessageIds.forEach(id => newSet.add(id))
        newSet.add(messageId)
        return { newMessageIds: newSet }
      }),
      clearNewMessageIds: () => set({ newMessageIds: new Set() }),

      fetchSessions: async () => {
        try {
          set({ isLoading: true, error: null })
          console.log('Fetching sessions from:', `${getApiUrl()}/chat`)
          const response = await fetch(`${getApiUrl()}/chat`)
          console.log('Response status:', response.status)
          if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`)
          
          const data = await response.json()
          console.log('Fetched sessions:', data)
          
          const sessions = data.map((session: any) => ({
            id: session._id,
            title: session.title,
            lastMessage: session.lastMessage,
            timestamp: new Date(session.timestamp),
            messageCount: session.messages?.length || 0,
            category: "general" as const,
          }))
          
          set({ sessions, isLoading: false })
        } catch (error) {
          console.error('Error fetching sessions:', error)
          console.log('Falling back to mock sessions')
          
          // Fallback to mock sessions
          const mockSessions: ChatSession[] = [
            {
              id: 'mock-1',
              title: 'Fire Safety Basics',
              lastMessage: 'Here are the basic fire safety rules...',
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              messageCount: 4,
              category: "safety" as const,
            },
            {
              id: 'mock-2',
              title: 'Emergency Procedures',
              lastMessage: 'In a fire emergency, follow these steps...',
              timestamp: new Date(Date.now() - 172800000), // 2 days ago
              messageCount: 6,
              category: "emergency" as const,
            },
            {
              id: 'mock-3',
              title: 'Kitchen Fire Prevention',
              lastMessage: 'To prevent kitchen fires...',
              timestamp: new Date(Date.now() - 259200000), // 3 days ago
              messageCount: 3,
              category: "safety" as const,
            }
          ]
          
          set({ 
            sessions: mockSessions, 
            isLoading: false, 
            error: null // Clear any previous errors
          })
        }
      },

      createSession: async (text: string) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Creating session with text:', text)
          console.log('API URL:', `${getApiUrl()}/chat`)
          const response = await fetch(`${getApiUrl()}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
          })
          
          console.log('Create session response status:', response.status)
          if (!response.ok) throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
          
          const data = await response.json()
          console.log('Created session:', data)
          
          const newSession: ChatSession = {
            id: data.sessionId,
            title: data.title,
            lastMessage: data.messages[data.messages.length - 1]?.response || '',
            timestamp: new Date(data.timestamp),
            messageCount: data.messages.length,
            category: "general" as const,
          }
          
          // Convert API message format to ChatMessage format with unique IDs
          const messages = data.messages.map((msg: any, index: number) => [
            {
              id: generateMessageId(msg.id, 'user', index),
              text: msg.prompt,
              isUser: true,
              timestamp: new Date(msg.timestamp),
            },
            {
              id: generateMessageId(msg.id, 'ai', index),
              text: msg.response,
              isUser: false,
              timestamp: new Date(msg.timestamp),
            }
          ]).flat()
          
          console.log('Converted messages:', messages)
          
          // Mark AI messages as new for typewriter effect
          const newMessageIds = new Set<string>()
          messages.forEach((msg: ChatMessage) => {
            if (!msg.isUser) {
              newMessageIds.add(msg.id)
            }
          })
          
          set({ 
            currentSession: newSession, 
            messages, 
            isInSession: true, 
            isLoading: false,
            sessions: [newSession, ...get().sessions],
            newMessageIds
          })
        } catch (error) {
          console.error('Error creating session:', error)
          console.log('Falling back to mock response for:', text)
          
          // Fallback to mock response
          const mockResponse = getMockResponse(text)
          const mockSession: ChatSession = {
            id: `mock-${Date.now()}`,
            title: text.length > 20 ? `${text.substring(0, 20)}...` : text,
            lastMessage: mockResponse,
            timestamp: new Date(),
            messageCount: 2,
            category: "general" as const,
          }
          
          const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text,
            isUser: true,
            timestamp: new Date(),
          }
          
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            text: mockResponse,
            isUser: false,
            timestamp: new Date(),
          }
          
          const messages = [userMessage, aiMessage]
          const newMessageIds = new Set([aiMessage.id])
          
          set({ 
            currentSession: mockSession, 
            messages, 
            isInSession: true, 
            isLoading: false,
            sessions: [mockSession, ...get().sessions],
            newMessageIds,
            error: null // Clear any previous errors
          })
        }
      },

      addMessage: async (sessionId: string, text: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // Add user message immediately
          const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text,
            isUser: true,
            timestamp: new Date(),
          }
          
          set(state => ({
            messages: [...state.messages, userMessage],
            isLoading: false
          }))
          
          // Send to API
          const response = await fetch(`${getApiUrl()}/chat/${sessionId}/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
          })
          
          if (!response.ok) throw new Error('Failed to send message')
          
          const data = await response.json()
          console.log('Added message response:', data)
          
          // Update the user message with backend ID and actual DB ID
          const updatedMessages = get().messages.map(msg => {
            if (msg.id === userMessage.id && msg.isUser) {
              return { 
                ...msg, 
                id: `${data.message.id}-user`, // Use actual DB message ID
                backendId: data.message._id,
                likeCount: data.message.likes || 0,
                dislikeCount: data.message.dislikes || 0,
                userFeedback: data.message.userFeedback || null,
              }
            }
            return msg
          })
          
          // Add AI response - the API returns the full message object
          const aiMessage: ChatMessage = {
            id: `${data.message.id}-ai`, // Use actual DB message ID
            text: data.message.response,
            isUser: false,
            timestamp: new Date(data.message.timestamp),
            backendId: data.message._id, // Store backend ID for API calls
            likeCount: data.message.likes || 0,
            dislikeCount: data.message.dislikes || 0,
            userFeedback: data.message.userFeedback || null,
          }
          
          // Mark this AI message as new for typewriter effect
          const currentNewMessageIds = get().newMessageIds
          const newMessageIds = new Set<string>()
          currentNewMessageIds.forEach(id => newMessageIds.add(id))
          newMessageIds.add(aiMessage.id)
          
          set(state => ({
            messages: [...updatedMessages, aiMessage],
            isLoading: false,
            newMessageIds
          }))
          
          // Update session in list
          const updatedSession = {
            ...get().currentSession!,
            lastMessage: text,
            timestamp: new Date(),
            messageCount: get().messages.length + 1,
          }
          
          set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === sessionId ? updatedSession : s
            )
          }))
          
        } catch (error) {
          console.error('Error adding message:', error)
          console.log('Falling back to mock response for message:', text)
          
          // Fallback to mock response
          const mockResponse = getMockResponse(text)
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            text: mockResponse,
            isUser: false,
            timestamp: new Date(),
          }
          
          // Mark this AI message as new for typewriter effect
          const currentNewMessageIds = get().newMessageIds
          const newMessageIds = new Set<string>()
          currentNewMessageIds.forEach(id => newMessageIds.add(id))
          newMessageIds.add(aiMessage.id)
          
          set(state => ({
            messages: [...state.messages, aiMessage],
            isLoading: false,
            newMessageIds,
            error: null // Clear any previous errors
          }))
          
          // Update session in list
          const updatedSession = {
            ...get().currentSession!,
            lastMessage: text,
            timestamp: new Date(),
            messageCount: get().messages.length + 1,
          }
          
          set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === sessionId ? updatedSession : s
            )
          }))
        }
      },

      fetchSession: async (sessionId: string) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Fetching session:', sessionId)
          
          const response = await fetch(`${getApiUrl()}/chat/${sessionId}`)
          
          if (!response.ok) throw new Error('Failed to fetch session')
          
          const data = await response.json()
          
          console.log('=== DATABASE SESSION DATA ===')
          console.log('Raw DB Session:', {
            _id: data._id,
            title: data.title,
            lastMessage: data.lastMessage,
            timestamp: data.timestamp,
            __v: data.__v
          })
          
          console.log('=== DATABASE MESSAGES ===')
          data.messages.forEach((msg: any, index: number) => {
            console.log(`Message ${index + 1}:`, {
              _id: msg._id,
              id: msg.id,
              prompt: msg.prompt,
              response: msg.response,
              timestamp: msg.timestamp,
              likes: msg.likes,
              dislikes: msg.dislikes,
              userFeedback: msg.userFeedback
            })
          })
          
          const session: ChatSession = {
            id: data._id?.$oid || data._id || data.id,
            title: data.title,
            lastMessage: data.lastMessage,
            timestamp: new Date(data.timestamp?.$date || data.timestamp),
            messageCount: data.messages.length,
            category: "general" as const,
          }
          
          // Convert API message format to ChatMessage format using actual DB IDs
          const messages = data.messages.map((msg: any, index: number) => [
            {
              id: `${msg.id}-user`, // Use actual DB message ID for user message
              text: msg.prompt,
              isUser: true,
              timestamp: new Date(msg.timestamp?.$date || msg.timestamp),
              backendId: msg._id?.$oid || msg._id, // Set backendId for API calls
              likeCount: msg.likes || 0,
              dislikeCount: msg.dislikes || 0,
              userFeedback: msg.userFeedback || null,
            },
            {
              id: `${msg.id}-ai`, // Use actual DB message ID for AI message
              text: msg.response,
              isUser: false,
              timestamp: new Date(msg.timestamp?.$date || msg.timestamp),
              backendId: msg._id?.$oid || msg._id, // Set backendId for API calls
              likeCount: msg.likes || 0,
              dislikeCount: msg.dislikes || 0,
              userFeedback: msg.userFeedback || null,
            }
          ]).flat()
          
          console.log('=== CONVERTED SESSION ===')
          console.log('Session:', {
            id: session.id,
            title: session.title,
            messageCount: session.messageCount
          })
          console.log('Messages with DB IDs:', messages.map((msg: any, idx: number) => ({
            index: idx,
            id: msg.id,
            backendId: msg.backendId,
            isUser: msg.isUser,
            prompt: msg.isUser ? msg.text : 'N/A',
            response: !msg.isUser ? msg.text.substring(0, 50) + '...' : 'N/A'
          })))
          
          // Clear new message IDs when opening existing session
          set({ 
            currentSession: session, 
            messages, 
            isInSession: true, 
            isLoading: false,
            newMessageIds: new Set()
          })
        } catch (error) {
          console.error('Error fetching session:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to fetch session', isLoading: false })
        }
      },

      startNewSession: (initialMessage?: string) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: initialMessage ? `Chat about "${initialMessage.substring(0, 20)}..."` : "New Chat",
          lastMessage: initialMessage || "Started a new conversation",
          timestamp: new Date(),
          messageCount: 0,
          category: "general",
        }
        set({ currentSession: newSession, messages: [], isInSession: true, newMessageIds: new Set() })
        
        if (initialMessage) {
          // Create session with initial message
          setTimeout(() => {
            get().createSession(initialMessage)
          }, 100)
        }
      },

      openSession: (session: ChatSession) => {
        console.log('=== OPENING SESSION FROM HISTORY ===')
        console.log('Session clicked:', {
          id: session.id,
          title: session.title,
          lastMessage: session.lastMessage,
          timestamp: session.timestamp,
          messageCount: session.messageCount,
          category: session.category
        })
        set({ currentSession: session, isInSession: true, newMessageIds: new Set() })
        get().fetchSession(session.id)
      },

      goBack: () => {
        set({ isInSession: false, currentSession: null, messages: [], newMessageIds: new Set() })
      },

      deleteSession: async (sessionId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // Try to delete from API first
          const response = await fetch(`${getApiUrl()}/chat/${sessionId}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            console.log('API delete failed, removing locally')
          }
          
          // Remove from local state regardless of API response
          const currentState = get()
          const updatedSessions = currentState.sessions.filter(session => session.id !== sessionId)
          
          // If we're currently viewing the deleted session, go back
          if (currentState.currentSession?.id === sessionId) {
            set({ 
              sessions: updatedSessions,
              isInSession: false, 
              currentSession: null, 
              messages: [], 
              newMessageIds: new Set(),
              isLoading: false 
            })
          } else {
            set({ sessions: updatedSessions, isLoading: false })
          }
        } catch (error) {
          console.error('Error deleting session:', error)
          // Still remove locally even if API fails
          const currentState = get()
          const updatedSessions = currentState.sessions.filter(session => session.id !== sessionId)
          
          if (currentState.currentSession?.id === sessionId) {
            set({ 
              sessions: updatedSessions,
              isInSession: false, 
              currentSession: null, 
              messages: [], 
              newMessageIds: new Set(),
              isLoading: false 
            })
          } else {
            set({ sessions: updatedSessions, isLoading: false })
          }
        }
      },

      resendMessage: async (sessionId: string, messageId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          // Find the message to resend
          const messageToResend = get().messages.find(msg => msg.id === messageId)
          if (!messageToResend || !messageToResend.isUser) {
            throw new Error('Message not found or not a user message')
          }
          
          // Remove the old AI response if it exists (the message after the user message)
          const messageIndex = get().messages.findIndex(msg => msg.id === messageId)
          const updatedMessages = [...get().messages]
          
          // Remove AI response that follows this user message
          if (messageIndex + 1 < updatedMessages.length && !updatedMessages[messageIndex + 1].isUser) {
            updatedMessages.splice(messageIndex + 1, 1)
          }
          
          set({ messages: updatedMessages })
          
          // Send the message again
          await get().addMessage(sessionId, messageToResend.text)
        } catch (error) {
          console.error('Error resending message:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to resend message', isLoading: false })
        }
      },

      deleteMessage: (messageId: string) => {
        const currentState = get()
        const updatedMessages = currentState.messages.filter(msg => msg.id !== messageId)
        
        set({ 
          messages: updatedMessages,
          // Update session message count
          currentSession: currentState.currentSession ? {
            ...currentState.currentSession,
            messageCount: updatedMessages.length
          } : null
        })
      },


      editMessage: (messageId: string, newText: string) => {
        const currentState = get()
        const updatedMessages = currentState.messages.map(msg => 
          msg.id === messageId ? { ...msg, text: newText } : msg
        )
        
        set({ messages: updatedMessages })
      },

      copyMessage: async (messageId: string) => {
        try {
          const currentState = get()
          const message = currentState.messages.find(msg => msg.id === messageId)
          
          if (message) {
            // For React Native, we'll use Clipboard API
            const Clipboard = await import('expo-clipboard')
            await Clipboard.setStringAsync(message.text)
            
            // You could also show a toast notification here
            console.log('Message copied to clipboard')
          }
        } catch (error) {
          console.error('Error copying message:', error)
        }
      },

      toggleLike: (messageId: string) => {
        set(state => {
          const newLikeCounts = new Map<string, number>()
          state.likeCounts.forEach((count, id) => newLikeCounts.set(id, count))
          
          const currentCount = newLikeCounts.get(messageId) || 0
          newLikeCounts.set(messageId, currentCount + 1)
          
          return { likeCounts: newLikeCounts }
        })
      },


      updatePrompt: async (sessionId: string, messageId: string, newPrompt: string) => {
        try {
          set({ isLoading: true, error: null })
          
          console.log('=== UPDATE PROMPT ===')
          console.log('Session ID:', sessionId)
          console.log('Message ID:', messageId)
          console.log('New Prompt:', newPrompt)
          
          // Validate inputs
          if (!sessionId || !messageId || !newPrompt) {
            console.error('Missing required parameters:', { sessionId, messageId, newPrompt })
            throw new Error('Session ID, Message ID, and new prompt are required')
          }
          
          // Test if the base API is reachable
          try {
            const healthCheck = await fetch(`${getApiUrl()}/health`)
            console.log('API Health Check Status:', healthCheck.status)
          } catch (error) {
            console.log('API Health Check Failed:', error)
          }
          
          const response = await fetch(`${getApiUrl()}/chat/${sessionId}/message/${messageId}/prompt`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPrompt }),
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error(`Failed to update prompt: ${response.status} ${response.statusText} - ${errorText}`)
          }
          
          const data = await response.json()
          console.log('=== API RESPONSE ===')
          console.log('Status:', response.status)
          console.log('Updated Message:', {
            id: data.message._id,
            prompt: data.message.prompt,
            response: data.message.response.substring(0, 50) + '...'
          })
          
          // Find the AI message that matches the messageId we sent to the API
          const aiMessageIndex = get().messages.findIndex(msg => {
            const msgBackendId = msg.backendId || msg.id
            return msgBackendId === messageId && !msg.isUser
          })
          
          // Find the user message that comes right before this AI message
          const userMessageIndex = aiMessageIndex > 0 ? aiMessageIndex - 1 : -1
          
          console.log('Message Indices:', {
            aiMessageIndex,
            userMessageIndex
          })
          
          // Update both messages
          const updatedMessages = get().messages.map((msg, index) => {
            if (index === aiMessageIndex) {
              console.log('Updating AI message:', msg.id, 'with new response:', data.message.response.substring(0, 50) + '...')
              return { 
                ...msg, 
                text: data.message.response, 
                timestamp: new Date(data.message.timestamp),
                backendId: data.message._id // Update backend ID
              }
            } else if (index === userMessageIndex) {
              console.log('Updating user message:', msg.id, 'with new prompt:', data.message.prompt.substring(0, 50) + '...')
              return { 
                ...msg, 
                text: data.message.prompt, 
                timestamp: new Date(data.message.timestamp),
                backendId: data.message._id // Update backend ID
              }
            }
            return msg
          })
          
          console.log('=== UPDATE COMPLETE ===')
          console.log('Messages updated successfully')
          
          // Update session title if provided
          if (data.updatedSession?.title) {
            const updatedSessions = get().sessions.map(session =>
              session.id === sessionId
                ? { ...session, title: data.updatedSession.title, lastMessage: data.message.response }
                : session
            )
            set({ sessions: updatedSessions })
          }
          
          set({ messages: updatedMessages, isLoading: false })
          
        } catch (error) {
          console.error('Error updating prompt:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to update prompt'
          
          // If it's a network error or API is not available, just update locally
          if (errorMessage.includes('404') || errorMessage.includes('Failed to fetch')) {
            console.log('API not available, updating prompt locally')
            get().editMessage(messageId, newPrompt)
          } else {
            set({ error: errorMessage, isLoading: false })
          }
        }
      },

      likeMessage: async (sessionId: string, messageId: string, action: 'like' | 'dislike') => {
        try {
          console.log('Liking message for session:', sessionId, 'message:', messageId, 'action:', action)
          
          const response = await fetch(`${getApiUrl()}/chat/${sessionId}/message/${messageId}/like`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          })
          
          if (!response.ok) {
            throw new Error(`Failed to like message: ${response.status} ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('Like message data:', data)
          
          // Update the message with new like/dislike counts
          const updatedMessages = get().messages.map(msg => {
            const msgBackendId = msg.backendId || msg.id
            if (msgBackendId === messageId) {
              console.log('Updating message like counts:', {
                messageId: msg.id,
                backendId: msgBackendId,
                newLikes: data.likes,
                newDislikes: data.dislikes,
                newUserFeedback: data.userFeedback
              })
              return { 
                ...msg, 
                likeCount: data.likes,
                dislikeCount: data.dislikes,
                userFeedback: data.userFeedback
              }
            }
            return msg
          })
          
          set({ messages: updatedMessages })
          
        } catch (error) {
          console.error('Error liking message:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to like message'
          
          // If it's a network error or API is not available, use local toggle
          if (errorMessage.includes('404') || errorMessage.includes('Failed to fetch')) {
            console.log('API not available, using local like toggle')
            get().toggleLike(messageId)
          } else {
            set({ error: errorMessage })
          }
        }
      },

      updateSessionTitle: async (sessionId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          console.log('Updating session title for session:', sessionId)
          
          const response = await fetch(`${getApiUrl()}/chat/${sessionId}/title`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`Failed to update session title: ${response.status} ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('Update session title data:', data)
          
          // Update the session title
          const updatedSessions = get().sessions.map(session =>
            session.id === sessionId
              ? { ...session, title: data.title }
              : session
          )
          
          // Also update current session if it's the same
          const currentSession = get().currentSession
          if (currentSession && currentSession.id === sessionId) {
            set({ 
              sessions: updatedSessions, 
              currentSession: { ...currentSession, title: data.title },
              isLoading: false 
            })
          } else {
            set({ sessions: updatedSessions, isLoading: false })
          }
          
        } catch (error) {
          console.error('Error updating session title:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to update session title'
          
          // If it's a network error or API is not available, just continue without updating title
          if (errorMessage.includes('404') || errorMessage.includes('Failed to fetch')) {
            console.log('API not available, skipping title update')
            set({ isLoading: false })
          } else {
            set({ error: errorMessage, isLoading: false })
          }
        }
      },
    }),
    {
      name: 'chat-store',
    }
  )
) 