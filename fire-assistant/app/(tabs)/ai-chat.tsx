"use client"

import { Ionicons } from "@expo/vector-icons"
import { marked } from 'marked'
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native"
import RenderHTML from 'react-native-render-html'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from "../../components/AnimatedScreen"
import { useChatStore } from "../../store/chatStore"

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  primaryDark: "#9A0007",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
}


// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// HTML renderer styles
const htmlStyles = {
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.secondary,
  },
  h1: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.secondary,
    marginBottom: 12,
    marginTop: 16,
    lineHeight: 24,
  },
  h2: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.secondary,
    marginBottom: 10,
    marginTop: 12,
    lineHeight: 22,
  },
  h3: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.secondary,
    marginBottom: 8,
    marginTop: 10,
    lineHeight: 20,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.secondary,
    marginBottom: 12,
  },
  strong: {
    fontWeight: '700' as const,
    color: Colors.secondary,
  },
  em: {
    fontStyle: 'italic' as const,
    color: Colors.secondary,
  },
  li: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.secondary,
    marginBottom: 6,
  },
  ul: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  ol: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  code: {
    backgroundColor: Colors.surface,
    color: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  pre: {
    backgroundColor: Colors.surface,
    color: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  blockquote: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 12,
    fontStyle: 'italic' as const,
  },
  a: {
    color: Colors.primary,
    textDecorationLine: 'underline' as const,
  },
} as any

// Markdown Renderer Component
interface MarkdownRendererProps {
  text: string
}

function MarkdownRenderer({ text }: MarkdownRendererProps) {
  const { width } = useWindowDimensions()
  
  // Convert markdown to HTML synchronously
  const htmlContent = text ? marked.parse(text) as string : ''
  
  if (!htmlContent) {
    return <Text style={styles.assistantText}>No content</Text>
  }
  
  return (
    <RenderHTML
      contentWidth={width * 0.8}
      source={{ html: htmlContent }}
      baseStyle={htmlStyles.body}
      tagsStyles={htmlStyles}
    />
  )
}

// Typewriter Markdown Component
interface TypewriterMarkdownProps {
  text: string
  style: any
  speed?: number
  onComplete?: () => void
}

function TypewriterMarkdown({ text, style, speed = 8, onComplete }: TypewriterMarkdownProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  // Reset when text changes
  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])
  
  useEffect(() => {
    if (isComplete || !text) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        // Show chunks of 3-5 characters at once for streaming effect
        const chunkSize = Math.min(4, text.length - currentIndex)
        setDisplayText(text.substring(0, currentIndex + chunkSize))
        setCurrentIndex(currentIndex + chunkSize)
      }, speed)

      return () => clearTimeout(timer)
    } else {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  const { width } = useWindowDimensions()
  
  // Convert markdown to HTML synchronously
  const htmlContent = displayText ? marked.parse(displayText) as string : ''
  
  return (
    <View style={style}>
      {htmlContent ? (
        <RenderHTML
          contentWidth={width * 0.8}
          source={{ html: htmlContent }}
          baseStyle={htmlStyles.body}
          tagsStyles={htmlStyles}
        />
      ) : null}
      {!isComplete && (
        <Text style={{ opacity: 0.5, fontSize: 15, color: Colors.secondary }}>|</Text>
      )}
    </View>
  )
}

export default function AIChatScreen() {
  const [inputText, setInputText] = useState("")
  const scrollViewRef = useRef<ScrollView>(null)
  const animatedValue = useRef(new Animated.Value(0)).current

  const {
    sessions,
    currentSession,
    messages,
    isInSession,
    isLoading,
    error,
    newMessageIds,
    fetchSessions,
    createSession,
    addMessage,
    startNewSession,
    openSession,
    goBack,
    deleteSession,
    resendMessage,
    deleteMessage,
    editMessage,
    copyMessage,
    toggleLike,
    likeMessage,
    updatePrompt,
    updateSessionTitle,
  } = useChatStore()

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error)
    }
  }, [error])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return

    const messageText = inputText.trim()
    setInputText("")

    if (!isInSession) {
      // Start new session from history screen
      await createSession(messageText)
    } else if (currentSession) {
      // Add message to existing session
      await addMessage(currentSession.id, messageText)
    }
  }

  const handleQuickPrompt = async (promptText: string) => {
    await createSession(promptText)
  }

  const handleStartNewSession = () => {
    startNewSession()
  }

  const handleOpenSession = (session: any) => {
    // Clear input when opening a session
    setInputText("")
    
    // Suggest continuing the conversation based on the session
    const suggestions = [
      "Tell me more about this",
      "Can you explain further?",
      "What else should I know?",
      "Continue the discussion"
    ]
    
    console.log('Suggested prompts:', suggestions)
    
    openSession(session)
  }

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this entire conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteSession(sessionId)
          }
        }
      ]
    )
  }

  const handleResendMessage = async (messageId: string) => {
    if (currentSession) {
      await resendMessage(currentSession.id, messageId)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMessage(messageId)
          }
        }
      ]
    )
  }


  const handleUpdatePrompt = async (sessionId: string, messageId: string, newPrompt: string) => {
    console.log('=== HANDLE UPDATE PROMPT ===')
    console.log('Session:', sessionId)
    console.log('Message:', messageId)
    console.log('New Prompt:', newPrompt)
    await updatePrompt(sessionId, messageId, newPrompt)
  }

  const handleEditMessage = (messageId: string, newText: string) => {
    editMessage(messageId, newText)
  }

  const handleCopyMessage = async (messageId: string) => {
    try {
      await copyMessage(messageId)
      // You could show a toast notification here
      Alert.alert("Copied", "Message copied to clipboard")
    } catch (error) {
      Alert.alert("Error", "Failed to copy message")
    }
  }

  const handleToggleLike = (messageId: string) => {
    console.log('=== TOGGLE LIKE ===')
    console.log('Message ID:', messageId)
    
    if (currentSession) {
      // Get current feedback state
      const message = messages.find(msg => msg.id === messageId)
      const currentFeedback = message?.userFeedback
      
      console.log('Current feedback:', currentFeedback)
      console.log('Message backendId:', message?.backendId)
      
      // Determine next action
      let action: 'like' | 'dislike'
      if (currentFeedback === 'like') {
        action = 'dislike' // Toggle to dislike
      } else {
        action = 'like' // Toggle to like
      }
      
      console.log('Action:', action)
      
      // Use backendId for API call, fallback to local ID
      const apiMessageId = message?.backendId || messageId
      console.log('API Message ID:', apiMessageId)
      
      likeMessage(currentSession.id, apiMessageId, action)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safety":
        return "shield-checkmark"
      case "emergency":
        return "warning"
      default:
        return "chatbubble-ellipses"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "safety":
        return Colors.success
      case "emergency":
        return Colors.danger
      default:
        return Colors.primary
    }
  }

  const quickPrompts = [
    { text: "What are basic fire safety rules?", icon: "shield-checkmark", color: Colors.success },
    { text: "How do I use a fire extinguisher?", icon: "school", color: Colors.warning },
    { text: "What to do in a fire emergency?", icon: "warning", color: Colors.danger },
    { text: "How to prevent kitchen fires?", icon: "restaurant", color: Colors.primary },
  ]

  if (isInSession) {
    return (
      <ChatSessionScreen
        messages={messages}
        newMessageIds={Array.from(newMessageIds || new Set())}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessage}
        onBack={goBack}
        onDeleteSession={handleDeleteSession}
        onResendMessage={handleResendMessage}
        onDeleteMessage={handleDeleteMessage}
        onEditMessage={handleEditMessage}
        onUpdatePrompt={handleUpdatePrompt}
        onCopyMessage={handleCopyMessage}
        onToggleLike={handleToggleLike}
        session={currentSession}
        isLoading={isLoading}
        scrollViewRef={scrollViewRef}
      />
    )
  }

  return (
    <ChatHistoryScreen
      chatHistory={sessions}
      onStartNewSession={handleStartNewSession}
      onOpenSession={handleOpenSession}
      onQuickPrompt={handleQuickPrompt}
      inputText={inputText}
      setInputText={setInputText}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      quickPrompts={quickPrompts}
      getCategoryIcon={getCategoryIcon}
      getCategoryColor={getCategoryColor}
    />
  )
}

interface ChatHistoryScreenProps {
  chatHistory: any[]
  onStartNewSession: () => void
  onOpenSession: (session: any) => void
  onQuickPrompt: (prompt: string) => void
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: () => void
  isLoading: boolean
  quickPrompts: any[]
  getCategoryIcon: (category: string) => string
  getCategoryColor: (category: string) => string
}

function ChatHistoryScreen({
  chatHistory,
  onStartNewSession,
  onOpenSession,
  onQuickPrompt,
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  quickPrompts,
  getCategoryIcon,
  getCategoryColor,
}: ChatHistoryScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <AnimatedScreen direction="fade" delay={100}>
        <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient} />
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.assistantIcon}>
                <Ionicons name="flame" size={24} color={Colors.background} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Fire Safety Assistant</Text>
                <Text style={styles.headerSubtitle}>AI-powered emergency guidance</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.newChatButton} onPress={onStartNewSession}>
              <Ionicons name="add" size={20} color={Colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Quick Actions / Conversation Starters */}
        <View style={styles.conversationStartersSection}>
          <Text style={styles.sectionTitle}>Start a new conversation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conversationStartersScroll}>
            <View style={styles.conversationStartersContainer}>
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.starterButton}
                  onPress={() => onQuickPrompt(prompt.text)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <View style={[styles.starterIconContainer, { backgroundColor: `${prompt.color}15` }]}>
                    <Ionicons name={prompt.icon as any} size={20} color={prompt.color} />
                  </View>
                  <Text style={styles.starterText}>{prompt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Chat History */}
        <View style={styles.chatHistorySection}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : (
            <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
              {chatHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color={Colors.tertiary} />
                  <Text style={styles.emptyStateTitle}>No conversations yet</Text>
                  <Text style={styles.emptyStateSubtitle}>Start your first conversation with the Fire Safety Assistant</Text>
                </View>
              ) : (
                chatHistory.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.chatItem}
                    onPress={() => onOpenSession(session)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chatItemIcon}>
                      <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(session.category)}15` }]}>
                        <Ionicons
                          name={getCategoryIcon(session.category) as any}
                          size={18}
                          color={getCategoryColor(session.category)}
                        />
                      </View>
                    </View>
                    <View style={styles.chatItemContent}>
                      <View style={styles.chatItemHeader}>
                        <Text style={styles.chatItemTitle}>{session.title}</Text>
                        <Text style={styles.chatItemTime}>{formatTime(session.timestamp)}</Text>
                      </View>
                      <Text style={styles.chatItemMessage} numberOfLines={2}>
                        {session.lastMessage ? session.lastMessage.split(' ').slice(0, 10).join(' ') + (session.lastMessage.split(' ').length > 10 ? '...' : '') : ''}
                      </Text>
                      <View style={styles.chatItemFooter}>
                        <Text style={styles.chatItemCount}>{session.messageCount} messages</Text>
                        <View style={styles.chatItemArrow}>
                          <Ionicons name="chevron-forward" size={16} color={Colors.tertiary} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>

        {/* Enhanced Input Section */}
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={onSendMessage}
          placeholder="Ask about fire safety, emergency procedures..."
          disabled={isLoading}
          isInSession={false}
          onQuickPrompt={onQuickPrompt}
        />
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  )
}

interface ChatSessionScreenProps {
  messages: any[]
  newMessageIds: string[]
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: () => void
  onBack: () => void
  onDeleteSession: (sessionId: string) => void
  onResendMessage: (messageId: string) => void
  onDeleteMessage: (messageId: string) => void
  onEditMessage: (messageId: string, newText: string) => void
  onUpdatePrompt: (sessionId: string, messageId: string, newPrompt: string) => void
  onCopyMessage: (messageId: string) => void
  onToggleLike: (messageId: string) => void
  session: any
  isLoading: boolean
  scrollViewRef: any
}

function ChatSessionScreen({
  messages,
  newMessageIds,
  inputText,
  setInputText,
  onSendMessage,
  onBack,
  onDeleteSession,
  onResendMessage,
  onDeleteMessage,
  onEditMessage,
  onUpdatePrompt,
  onCopyMessage,
  onToggleLike,
  session,
  isLoading,
  scrollViewRef,
}: ChatSessionScreenProps) {
  const [showSessionMenu, setShowSessionMenu] = useState(false)
  // Add debugging
  console.log('ChatSessionScreen render:', {
    messagesCount: messages?.length || 0,
    messages: messages,
    session: session,
    isLoading: isLoading,
    newMessageIds: newMessageIds
  })

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <AnimatedScreen direction="fade" delay={100}>
        <View style={styles.container}>
        {/* Red Header with Notch Extension */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient} />
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="document-text" size={20} color={Colors.background} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {session?.title || 'Chat Session'}
              </Text>
              </View>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={16} color={Colors.background} />
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.messagesContent}>
            {!messages || messages.length === 0 ? (
              <View style={styles.emptyMessagesState}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.tertiary} />
                <Text style={styles.emptyMessagesTitle}>No messages yet</Text>
                <Text style={styles.emptyMessagesSubtitle}>Start the conversation by sending a message</Text>
              </View>
            ) : (
              messages.map((message, index) => {
                console.log('=== MESSAGE BUBBLE DEBUG ===')
                console.log('Session object:', session)
                console.log('Session ID:', session?.id)
                console.log('Message:', message)
                console.log('Message ID:', message?.id)
                console.log('Message isUser:', message?.isUser)
                
                return (
                <MessageBubble
                  key={message?.id || index}
                  message={message}
                  isNewMessage={newMessageIds?.includes(message?.id) || false}
                    onEditMessage={onEditMessage}
                    onUpdatePrompt={onUpdatePrompt}
                    onCopyMessage={onCopyMessage}
                    onToggleLike={onToggleLike}
                    sessionId={session?.id}
                    messages={messages}
                  />
                )
              })
            )}
            {isLoading && (
              <View style={styles.typingIndicator}>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input Section */}
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={onSendMessage}
          placeholder="Ask anything"
          disabled={isLoading}
          isInSession={true}
        />

        {/* Session Menu Modal */}
        <Modal
          visible={showSessionMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSessionMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSessionMenu(false)}
          >
            <View style={styles.sessionMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowSessionMenu(false)
                  onDeleteSession(session?.id)
                }}
              >
                <Ionicons name="trash" size={20} color={Colors.danger} />
                <Text style={[styles.menuItemText, { color: Colors.danger }]}>Delete Conversation</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowSessionMenu(false)}
              >
                <Ionicons name="share" size={20} color={Colors.primary} />
                <Text style={styles.menuItemText}>Share Conversation</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowSessionMenu(false)}
              >
                <Ionicons name="copy" size={20} color={Colors.primary} />
                <Text style={styles.menuItemText}>Copy Session ID</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  )
}

interface MessageBubbleProps {
  message: any
  isNewMessage?: boolean
  onEditMessage?: (messageId: string, newText: string) => void
  onUpdatePrompt?: (sessionId: string, messageId: string, newPrompt: string) => void
  onCopyMessage?: (messageId: string) => void
  onToggleLike?: (messageId: string) => void
  sessionId?: string
  messages?: any[]
}

function MessageBubble({ 
  message, 
  isNewMessage = false, 
  onEditMessage, 
  onUpdatePrompt,
  onCopyMessage, 
  onToggleLike,
  sessionId,
  messages
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message?.text || '')
  
  // Handle edit actions
  const handleStartEdit = () => {
    console.log('=== START EDIT ===')
    console.log('Message:', message?.id)
    console.log('Current Text:', message?.text)
    setIsEditing(true)
    setEditText(message?.text || '')
  }
  
  const handleSaveEdit = async () => {
    console.log('=== SAVE EDIT ===')
    console.log('Session:', sessionId)
    console.log('Message:', message?.id)
    console.log('New Text:', editText.trim())
    
    if (editText.trim() !== '' && editText.trim() !== message?.text && sessionId) {
      // Find the AI message that follows this user message
      const messageList = messages || []
      const currentIndex = messageList.findIndex(msg => msg.id === message.id)
      
      if (currentIndex !== -1 && currentIndex + 1 < messageList.length) {
        const aiMessage = messageList[currentIndex + 1]
        
        if (!aiMessage.isUser) {
          // Use backendId if available, otherwise fall back to local ID
          const messageIdToUse = aiMessage.backendId || aiMessage.id
          console.log('AI Message ID:', messageIdToUse)
          // Use updatePrompt API to update the prompt and generate new AI response
          await onUpdatePrompt?.(sessionId, messageIdToUse, editText.trim())
        } else {
          console.log('No AI message found, using local edit')
          onEditMessage?.(message.id, editText.trim())
        }
      } else {
        console.log('No AI message found, using local edit')
        onEditMessage?.(message.id, editText.trim())
      }
    }
    setIsEditing(false)
  }
  
  const handleCancelEdit = () => {
    setEditText(message?.text || '')
    setIsEditing(false)
  }
  
  // Add debugging
  console.log('MessageBubble render:', {
    id: message?.id,
    text: message?.text,
    isUser: message?.isUser,
    timestamp: message?.timestamp,
    isNewMessage: isNewMessage
  })

  // Early return if message is undefined
  if (!message) {
    return null
  }

  return (
    <View style={[styles.messageWrapper, message.isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper]}>
      {/* Clean Message Bubble - No Avatars, No Action Buttons */}
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.assistantBubble]}>
        {message.isUser ? (
          isEditing ? (
            <>
              <TextInput
                style={styles.userText}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                placeholder="Edit your message..."
              />
              <View style={styles.inlineEditButtons}>
                <TouchableOpacity style={styles.inlineCancelButton} onPress={handleCancelEdit}>
                  <Ionicons name="close" size={14} color={Colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inlineSubmitButton} onPress={handleSaveEdit}>
                  <Ionicons name="checkmark" size={14} color={Colors.success} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.userText}>
            {message.text || ''}
          </Text>
          )
        ) : (
          isNewMessage ? (
            <TypewriterMarkdown
              text={message.text || ''}
              style={styles.assistantText}
              speed={8}
            />
          ) : (
            message.text && typeof message.text === 'string' ? (
              <MarkdownRenderer text={message.text} />
            ) : (
              <Text style={styles.assistantText}>{message.text || 'No content'}</Text>
            )
          )
        )}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.messageActions}>
        {message.isUser ? (
          // User message actions: Edit and Copy
          <>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                console.log('Edit button clicked for message:', message?.id)
                handleStartEdit()
              }}
            >
              <Ionicons name="create-outline" size={16} color={Colors.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onCopyMessage?.(message.id)}
            >
              <Ionicons name="copy-outline" size={16} color={Colors.tertiary} />
            </TouchableOpacity>
          </>
        ) : (
          // AI response actions: Copy and Like
          <>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onCopyMessage?.(message.id)}
            >
              <Ionicons name="copy-outline" size={16} color={Colors.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onToggleLike?.(message.id)}
            >
              <View style={styles.likeButtonContainer}>
                <Ionicons 
                  name={message.userFeedback === 'like' ? "heart" : "heart-outline"} 
                  size={16} 
                  color={message.userFeedback === 'like' ? Colors.primary : Colors.tertiary} 
                />
                {(message.likeCount || 0) > 0 && (
                  <Text style={styles.likeCount}>{message.likeCount || 0}</Text>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

interface ChatInputProps {
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: () => void
  placeholder: string
  disabled?: boolean
  isInSession?: boolean
  onQuickPrompt?: (prompt: string) => void
}

function ChatInput({ inputText, setInputText, onSendMessage, placeholder, disabled, isInSession, onQuickPrompt }: ChatInputProps) {
  const handleIconPress = (iconName: string) => {
    console.log('=== CHAT INPUT ICON PRESSED ===')
    console.log('Icon:', iconName)
    console.log('Is in session:', isInSession)
    
    if (iconName === 'mic' && !isInSession) {
      // In chat history, mic could suggest voice input or quick prompts
      console.log('Voice input suggested')
    } else if (iconName === 'globe' && !isInSession) {
      // In chat history, globe could suggest web search
      console.log('Web search suggested')
    }
  }

  return (
    <View style={styles.inputSection}>
      <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={placeholder}
            placeholderTextColor={Colors.tertiary}
            multiline
            maxLength={500}
            editable={!disabled}
          />
        <View style={styles.inputIcons}>
          <TouchableOpacity style={styles.inputIcon} onPress={() => handleIconPress('attach')}>
            <Ionicons name="attach" size={16} color={Colors.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon} onPress={() => handleIconPress('globe')}>
            <Ionicons name="globe" size={16} color={Colors.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon} onPress={() => handleIconPress('mic')}>
            <Ionicons name="mic" size={16} color={Colors.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon} onPress={() => handleIconPress('ellipsis')}>
            <Ionicons name="ellipsis-horizontal" size={16} color={Colors.tertiary} />
          </TouchableOpacity>
        </View>
          <TouchableOpacity
            style={[styles.sendButton, (inputText.trim() === "" || disabled) && styles.sendButtonDisabled]}
            onPress={onSendMessage}
            disabled={inputText.trim() === "" || disabled}
          >
          <Ionicons name="arrow-up" size={18} color={Colors.background} />
          </TouchableOpacity>
        </View>
      <Text style={styles.disclaimerText}>
        {isInSession 
          ? "AI can make mistakes. Please double-check responses."
          : "Start a new conversation or continue an existing one"
        }
      </Text>
      </View>
  )
}

function formatTime(date: Date | undefined): string {
  if (!date) return "Just now"
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: "relative",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 30, // Extend into notch area
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  assistantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.background,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.background,
    opacity: 0.8,
    marginTop: 1,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  conversationStartersSection: {
    paddingVertical: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  conversationStartersScroll: {
    paddingLeft: 20,
  },
  conversationStartersContainer: {
    flexDirection: "row",
    gap: 12,
  },
  starterButton: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  starterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  starterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    textAlign: "center",
  },
  chatHistorySection: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    letterSpacing: -0.3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.tertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  chatHistory: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  chatItemIcon: {
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chatItemContent: {
    flex: 1,
  },
  chatItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
    flex: 1,
  },
  chatItemTime: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  chatItemMessage: {
    fontSize: 14,
    color: Colors.tertiary,
    marginBottom: 8,
    lineHeight: 20,
  },
  chatItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatItemCount: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  chatItemArrow: {
    opacity: 0.6,
  },
  backButton: {
    padding: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  assistantMessageWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.background,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.secondary,
  },
  messageActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  likedButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  likeButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  likeCount: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.tertiary,
    marginLeft: 4,
  },
  inlineEditButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  inlineCancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  inlineSubmitButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  typingBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 20,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tertiary,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputSection: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
    paddingVertical: 4,
    paddingRight: 8,
  },
  inputIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginRight: 8,
  },
  inputIcon: {
    padding: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.tertiary,
    textAlign: "center",
    marginTop: 4,
  },
  emptyMessagesState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyMessagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessagesSubtitle: {
    fontSize: 14,
    color: Colors.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sessionMenu: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.secondary,
    marginLeft: 12,
    fontWeight: "500",
  },
})
