"use client"

import { Ionicons } from "@expo/vector-icons"
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
  View
} from "react-native"
import Markdown from 'react-native-markdown-display'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from "../../components/AnimatedScreen"
import { useChatStore } from "../../store/chatStore"

const NB = {
  border: '#1A1A1A',
  primary: '#C41230',
  bg: '#FFF8EF',
  surface: '#FFFFFF',
  muted: '#78716C',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#E8A020',
  secondary: '#1A1A1A',
  tertiary: '#78716C',
};
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

// Markdown Styles for react-native-markdown-display
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: NB.secondary,
  },
  heading1: {
    fontSize: 18,
    fontWeight: '800',
    color: NB.secondary,
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 17,
    fontWeight: '700',
    color: NB.secondary,
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: NB.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: NB.secondary,
    marginBottom: 8,
  },
  strong: {
    fontWeight: '700',
    color: NB.secondary,
  },
  em: {
    fontStyle: 'italic',
    color: NB.secondary,
  },
  link: {
    color: NB.primary,
  },
  blockquote: {
    backgroundColor: NB.surface,
    borderLeftWidth: 4,
    borderLeftColor: NB.primary,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  code: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    color: NB.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    fontSize: 13,
  },
  code_block: {
    backgroundColor: '#1A1A1A',
    color: '#D4C4B5',
    padding: 12,
    borderRadius: 0,
    marginBottom: 8,
    fontSize: 13,
  },
  bullet_list: {
    marginBottom: 8,
    paddingLeft: 20,
  },
  ordered_list: {
    marginBottom: 8,
    paddingLeft: 20,
  },
  list_item: {
    fontSize: 15,
    lineHeight: 22,
    color: NB.secondary,
    marginBottom: 4,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: NB.border,
    marginVertical: 12,
  },
  table: {
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: NB.border,
    borderRadius: 0,
  },
  th: {
    backgroundColor: NB.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontWeight: '700',
    fontSize: 13,
    color: NB.secondary,
  },
  td: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: NB.secondary,
  },
})

// History Markdown Styles - Lighter style for chat history previews
const historyMarkdownStyles = StyleSheet.create({
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: NB.tertiary,
  },
  heading1: {
    fontSize: 14,
    fontWeight: '700',
    color: NB.secondary,
    marginTop: 4,
    marginBottom: 2,
  },
  heading2: {
    fontSize: 14,
    fontWeight: '600',
    color: NB.secondary,
    marginTop: 4,
    marginBottom: 2,
  },
  heading3: {
    fontSize: 13,
    fontWeight: '600',
    color: NB.secondary,
    marginTop: 4,
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 18,
    color: NB.tertiary,
    marginBottom: 4,
  },
  strong: {
    fontWeight: '600',
    color: NB.secondary,
  },
  em: {
    fontStyle: 'italic',
    color: NB.tertiary,
  },
  link: {
    color: NB.primary,
  },
  blockquote: {
    backgroundColor: NB.surface,
    borderLeftWidth: 3,
    borderLeftColor: NB.primary,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  code: {
    backgroundColor: NB.surface,
    color: NB.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
  },
  fence: {
    backgroundColor: '#1A1A1A',
    color: '#D4C4B5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#1A1A1A',
    color: '#D4C4B5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  bullet_list: {
    marginBottom: 4,
    paddingLeft: 16,
  },
  ordered_list: {
    marginBottom: 4,
    paddingLeft: 16,
  },
  list_item: {
    fontSize: 13,
    lineHeight: 18,
    color: NB.tertiary,
    marginBottom: 2,
  },
  image: {
    marginVertical: 4,
    borderRadius: 6,
  },
})

// Normalize markdown - fix common issues before rendering
function normalizeMarkdown(md: string): string {
  if (!md) return ""
  return md
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/---/g, "\n\n---\n\n")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    .trim()
}

// Helper function to clean markdown for history preview
function cleanMarkdownForHistory(text: string): string {
  if (!text) return ''
  // Remove excessive whitespace and newlines
  let cleaned = text.replace(/\n{3,}/g, '\n\n').trim()
  // Limit to reasonable length for preview
  const words = cleaned.split(/\s+/)
  if (words.length > 20) {
    cleaned = words.slice(0, 20).join(' ') + '...'
  }
  return cleaned
}

// Markdown Renderer Component
interface MarkdownRendererProps {
  text: string
  style?: any
}

function MarkdownRenderer({ text, style }: MarkdownRendererProps) {
  if (!text) {
    return <Text style={[styles.assistantText, style]}>No content</Text>
  }

  // Normalize markdown before rendering to fix common issues
  const normalizedText = normalizeMarkdown(text)

  return (
    <Markdown
      style={markdownStyles}
      children={normalizedText}
    />
  )
}

// History Markdown Renderer - Lighter style for chat history previews
interface HistoryMarkdownRendererProps {
  text: string
  style?: any
}

function HistoryMarkdownRenderer({ text, style }: HistoryMarkdownRendererProps) {
  if (!text) return null

  const cleanedText = cleanMarkdownForHistory(text)

  return (
    <Markdown
      style={historyMarkdownStyles}
      children={cleanedText}
    />
  )
}

// Typewriter Markdown Component
interface TypewriterMarkdownProps {
  text: string
  style?: any
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
        // Show chunks of 4 characters at once for streaming effect
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

  if (!displayText) {
    return null
  }

  return (
    <View style={style}>
      {/* ✅ While typing: show plain text (prevents broken markdown parsing) */}
      {!isComplete ? (
        <Text style={{ fontSize: 15, lineHeight: 22, color: NB.secondary }}>
          {displayText}
          <Text style={{ opacity: 0.5 }}>|</Text>
        </Text>
      ) : (
        /* ✅ When complete: render markdown */
        <MarkdownRenderer text={displayText} />
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
    await updatePrompt(sessionId, messageId, newPrompt)
  }

  const handleEditMessage = (messageId: string, newText: string) => {
    editMessage(messageId, newText)
  }

  const handleCopyMessage = async (messageId: string) => {
    try {
      await copyMessage(messageId)
      Alert.alert("Copied", "Message copied to clipboard")
    } catch (error) {
      Alert.alert("Error", "Failed to copy message")
    }
  }

  const handleToggleLike = (messageId: string) => {
    if (currentSession) {
      const message = messages.find(msg => msg.id === messageId)
      const apiMessageId = message?.backendId || messageId
      let action: 'like' | 'dislike'
      if (message?.userFeedback === 'like') {
        action = 'dislike'
      } else {
        action = 'like'
      }
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
        return NB.success
      case "emergency":
        return NB.danger
      default:
        return NB.primary
    }
  }

  const quickPrompts = [
    { text: "What are basic fire safety rules?", icon: "shield-checkmark", color: NB.success },
    { text: "How do I use a fire extinguisher?", icon: "school", color: NB.warning },
    { text: "What to do in a fire emergency?", icon: "warning", color: NB.danger },
    { text: "How to prevent kitchen fires?", icon: "restaurant", color: NB.primary },
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
      <StatusBar backgroundColor={NB.primary} barStyle="light-content" />
      <AnimatedScreen direction="fade" delay={100}>
        <View style={styles.container}>
          {/* Enhanced Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerGradient} />
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.assistantIcon}>
                  <Ionicons name="flame" size={24} color={NB.surface} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Fire Safety Assistant</Text>
                  <Text style={styles.headerSubtitle}>AI-powered emergency guidance</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.newChatButton} onPress={onStartNewSession}>
                <Ionicons name="add" size={20} color={NB.border} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
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
                <ActivityIndicator size="large" color={NB.primary} />
                <Text style={styles.loadingText}>Loading conversations...</Text>
              </View>
            ) : (
              <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
                {chatHistory.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={48} color={NB.tertiary} />
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
                        <HistoryMarkdownRenderer
                          text={session.lastMessage}
                          style={styles.chatItemMessage}
                        />
                        <View style={styles.chatItemFooter}>
                          <Text style={styles.chatItemCount}>{session.messageCount} messages</Text>
                          <View style={styles.chatItemArrow}>
                            <Ionicons name="chevron-forward" size={16} color={NB.tertiary} />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>

          {/* Input Section */}
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor={NB.primary} barStyle="light-content" />
      <AnimatedScreen direction="fade" delay={100}>
        <View style={styles.container}>
          {/* Red Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerGradient} />
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={24} color={NB.secondary} />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {session?.title || 'Chat Session'}
                </Text>
              </View>
              <View style={styles.headerAvatar}>
                <Ionicons name="person" size={16} color={NB.surface} />
              </View>
            </View>
          </View>

          {/* Messages */}
          <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.messagesContent}>
              {!messages || messages.length === 0 ? (
                <View style={styles.emptyMessagesState}>
                  <Ionicons name="chatbubbles-outline" size={48} color={NB.tertiary} />
                  <Text style={styles.emptyMessagesTitle}>No messages yet</Text>
                  <Text style={styles.emptyMessagesSubtitle}>Start the conversation by sending a message</Text>
                </View>
              ) : (
                messages.map((message, index) => (
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
                ))
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
                  <Ionicons name="trash" size={20} color={NB.danger} />
                  <Text style={[styles.menuItemText, { color: NB.danger }]}>Delete Conversation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setShowSessionMenu(false)}
                >
                  <Ionicons name="share" size={20} color={NB.primary} />
                  <Text style={styles.menuItemText}>Share Conversation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setShowSessionMenu(false)}
                >
                  <Ionicons name="copy" size={20} color={NB.primary} />
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

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditText(message?.text || '')
  }

  const handleSaveEdit = async () => {
    if (editText.trim() !== '' && editText.trim() !== message?.text && sessionId) {
      const messageList = messages || []
      const currentIndex = messageList.findIndex(msg => msg.id === message.id)

      if (currentIndex !== -1 && currentIndex + 1 < messageList.length) {
        const aiMessage = messageList[currentIndex + 1]
        if (!aiMessage.isUser) {
          const messageIdToUse = aiMessage.backendId || aiMessage.id
          await onUpdatePrompt?.(sessionId, messageIdToUse, editText.trim())
        } else {
          onEditMessage?.(message.id, editText.trim())
        }
      } else {
        onEditMessage?.(message.id, editText.trim())
      }
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(message?.text || '')
    setIsEditing(false)
  }

  // Early return if message is undefined
  if (!message) {
    return null
  }

  return (
    <View style={[styles.messageWrapper, message.isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper]}>
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
                  <Ionicons name="close" size={14} color={NB.danger} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inlineSubmitButton} onPress={handleSaveEdit}>
                  <Ionicons name="checkmark" size={14} color={NB.success} />
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
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartEdit}
            >
              <Ionicons name="create-outline" size={16} color={NB.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onCopyMessage?.(message.id)}
            >
              <Ionicons name="copy-outline" size={16} color={NB.tertiary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onCopyMessage?.(message.id)}
            >
              <Ionicons name="copy-outline" size={16} color={NB.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onToggleLike?.(message.id)}
            >
              <View style={styles.likeButtonContainer}>
                <Ionicons
                  name={message.userFeedback === 'like' ? "heart" : "heart-outline"}
                  size={16}
                  color={message.userFeedback === 'like' ? NB.primary : NB.tertiary}
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

function ChatInput({ inputText, setInputText, onSendMessage, placeholder, disabled, isInSession }: ChatInputProps) {
  return (
    <View style={styles.inputSection}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor={NB.tertiary}
          multiline
          maxLength={500}
          editable={!disabled}
        />
        <View style={styles.inputIcons}>
          <TouchableOpacity style={styles.inputIcon} onPress={() => { }}>
            <Ionicons name="attach" size={16} color={NB.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon} onPress={() => { }}>
            <Ionicons name="globe" size={16} color={NB.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon} onPress={() => { }}>
            <Ionicons name="mic" size={16} color={NB.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon} onPress={() => { }}>
            <Ionicons name="ellipsis-horizontal" size={16} color={NB.tertiary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sendButton, (inputText.trim() === "" || disabled) && styles.sendButtonDisabled]}
          onPress={onSendMessage}
          disabled={inputText.trim() === "" || disabled}
        >
          <Ionicons name="arrow-up" size={18} color={NB.surface} />
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
    backgroundColor: NB.surface,
  },
  container: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  headerContainer: {
    position: "relative",
  },
  headerGradient: {
    display: 'none',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 30,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
    backgroundColor: NB.surface,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  assistantIcon: {
    width: 48,
    height: 48,
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    ...nbShadow,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NB.secondary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: NB.tertiary,
    marginTop: 1,
  },
  newChatButton: {
    width: 40,
    height: 40,
    backgroundColor: NB.bg,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    ...nbShadow,
  },
  conversationStartersSection: {
    paddingVertical: 20,
    backgroundColor: NB.surface,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
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
    backgroundColor: NB.surface,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: NB.border,
    ...nbShadow,
  },
  starterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  starterText: {
    fontSize: 14,
    fontWeight: "600",
    color: NB.secondary,
    textAlign: "center",
  },
  chatHistorySection: {
    flex: 1,
    backgroundColor: NB.bg,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NB.secondary,
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
    color: NB.tertiary,
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
    color: NB.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: NB.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  chatHistory: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderWidth: 2.5,
    borderColor: NB.border,
    borderRadius: 0,
    backgroundColor: NB.surface,
    shadowColor: NB.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  chatItemIcon: {
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: NB.border,
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
    marginBottom: 6,
  },
  chatItemTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: NB.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    flex: 1,
  },
  chatItemTime: {
    fontSize: 10,
    color: NB.tertiary,
    fontWeight: "800",
    textTransform: "uppercase",
    marginLeft: 8,
  },
  chatItemMessage: {
    fontSize: 13,
    color: NB.tertiary,
    marginBottom: 8,
    lineHeight: 18,
  },
  chatItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatItemCount: {
    fontSize: 11,
    color: NB.primary,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chatItemArrow: {
    opacity: 0.8,
  },
  backButton: {
    padding: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    ...nbShadow,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
    marginLeft: 40,
  },
  assistantMessageWrapper: {
    alignItems: 'flex-start',
    marginRight: 40,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: NB.border,
    ...nbShadow,
  },
  userBubble: {
    backgroundColor: NB.primary,
  },
  assistantBubble: {
    backgroundColor: NB.surface,
  },
  userText: {
    fontSize: 15,
    lineHeight: 20,
    color: NB.surface,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 20,
    color: NB.secondary,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: NB.border,
    backgroundColor: NB.surface,
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
    color: NB.tertiary,
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
    borderRadius: 0,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: NB.danger,
  },
  inlineSubmitButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 0,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: NB.success,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  typingBubble: {
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    borderRadius: 0,
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
    borderRadius: 0,
    backgroundColor: NB.tertiary,
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
    backgroundColor: NB.surface,
    borderTopWidth: 3,
    borderTopColor: NB.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    ...nbShadow,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: NB.secondary,
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
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: NB.border,
  },
  disclaimerText: {
    fontSize: 12,
    color: NB.tertiary,
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
    color: NB.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessagesSubtitle: {
    fontSize: 14,
    color: NB.tertiary,
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
    backgroundColor: NB.surface,
    paddingVertical: 8,
    minWidth: 200,
    borderWidth: 3,
    borderColor: NB.border,
    ...nbShadow,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: NB.secondary,
    marginLeft: 12,
    fontWeight: "500",
  },
})
