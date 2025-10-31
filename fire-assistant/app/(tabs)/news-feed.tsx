"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from "../../components/AnimatedScreen"

const TABS = ["All", "Incidents", "Safety", "Others"]
const SCREEN_WIDTH = Dimensions.get("window").width

const Colors = {
  primary: "#e02a1f",
  primaryLight: "#FF6659",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  accent: "#8B5CF6",
}

const MOCK_NEWS = [
  {
    id: "1",
    title: "Fire outbreak contained at Makola Market",
    summary: "A swift response from the fire service helped contain a blaze at Makola Market. No casualties reported.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    source: "Ghana News",
    category: "Incidents",
    timestamp: "2h ago",
    readTime: "3 min read",
    priority: "high",
  },
  {
    id: "2",
    title: "Fire safety week: Tips for every household",
    summary:
      "The National Fire Service shares essential tips to keep your home and family safe during fire safety week.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    source: "Daily Graphic",
    category: "Safety",
    timestamp: "5h ago",
    readTime: "5 min read",
    priority: "medium",
  },
  {
    id: "3",
    title: "Rescue operation at Accra Central",
    summary: "Firefighters rescued 5 people from a burning building in Accra Central.",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    source: "GBC",
    category: "Incidents",
    timestamp: "1d ago",
    readTime: "4 min read",
    priority: "high",
  },
  {
    id: "4",
    title: "Community donates fire extinguishers",
    summary: "A local community donated fire extinguishers to schools and churches to improve safety.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80",
    source: "Joy News",
    category: "Others",
    timestamp: "2d ago",
    readTime: "2 min read",
    priority: "low",
  },
  {
    id: "5",
    title: "Fire drill at Ridge Hospital",
    summary: "Ridge Hospital conducted a fire drill to test emergency preparedness.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    source: "GhanaWeb",
    category: "Safety",
    timestamp: "3d ago",
    readTime: "3 min read",
    priority: "medium",
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Incidents":
      return Colors.primary
    case "Safety":
      return Colors.success
    case "Others":
      return Colors.accent
    default:
      return Colors.tertiary
  }
}

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case "high":
      return { color: Colors.primary, icon: "flame" }
    case "medium":
      return { color: Colors.warning, icon: "warning" }
    case "low":
      return { color: Colors.success, icon: "information-circle" }
    default:
      return { color: Colors.tertiary, icon: "radio" }
  }
}

function NewsList({ filter }: { filter: string }) {
  const filtered = filter === "All" ? MOCK_NEWS : MOCK_NEWS.filter((n) => n.category === filter)

  return (
    <ScrollView contentContainerStyle={styles.newsList} showsVerticalScrollIndicator={false}>
      {filtered.map((news, index) => {
        const categoryColor = getCategoryColor(news.category)
        const priorityInfo = getPriorityIndicator(news.priority)

        return (
          <TouchableOpacity key={news.id} style={styles.newsCard} activeOpacity={0.95}>
            {/* Priority Indicator Strip */}
            <View style={[styles.priorityStrip, { backgroundColor: priorityInfo.color }]} />

            {/* Main Content Container */}
            <View style={styles.cardContent}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                  <Text style={[styles.categoryText, { color: categoryColor }]}>{news.category}</Text>
                </View>

                <View style={styles.metaInfo}>
                  <Ionicons name="time-outline" size={12} color={Colors.tertiary} />
                  <Text style={styles.timestampText}>{news.timestamp}</Text>
                </View>
              </View>

              {/* Content Section */}
              <View style={styles.contentSection}>
                {/* Image Container */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: news.image }} style={styles.newsImage} />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.3)"]} style={styles.imageOverlay} />
                  <View style={styles.priorityBadge}>
                    <Ionicons name={priorityInfo.icon as any} size={12} color="#fff" />
                  </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {news.title}
                  </Text>
                  <Text style={styles.newsSummary} numberOfLines={3}>
                    {news.summary}
                  </Text>

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.sourceContainer}>
                      <Ionicons name="radio-outline" size={14} color={Colors.tertiary} />
                      <Text style={styles.sourceText}>{news.source}</Text>
                    </View>

                    <View style={styles.readTimeContainer}>
                      <Ionicons name="book-outline" size={12} color={Colors.tertiary} />
                      <Text style={styles.readTimeText}>{news.readTime}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )
      })}

      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={48} color={Colors.tertiary} />
          <Text style={styles.emptyStateText}>No news in this category</Text>
          <Text style={styles.emptyStateSubtext}>Check back later for updates</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default function NewsScreen() {
  const [activeTab, setActiveTab] = useState(0)
  const indicatorAnim = useRef(new Animated.Value(0)).current

  const handleTabPress = (idx: number) => {
    setActiveTab(idx)
    Animated.spring(indicatorAnim, {
      toValue: idx * (SCREEN_WIDTH / TABS.length),
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start()
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <AnimatedScreen direction="up" delay={100}>
        <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fire News & Updates</Text>
          <Text style={styles.headerSubtitle}>Stay informed with the latest fire safety news</Text>
        </View>

        {/* Improved Tab Bar */}
        <View style={styles.topBar}>
          <View style={styles.tabContainer}>
            {TABS.map((tab, idx) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === idx && styles.activeTab]}
                onPress={() => handleTabPress(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: SCREEN_WIDTH / TABS.length - 32,
                left: indicatorAnim,
              },
            ]}
          />
        </View>

        <NewsList filter={TABS[activeTab]} />
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.tertiary,
    fontWeight: "500",
  },

  // Enhanced Tab Bar
  topBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginHorizontal: 16,
  },

  // News List
  newsList: {
    padding: 20,
    gap: 16,
  },

  // Enhanced News Card
  newsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    position: "relative",
  },

  priorityStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 1,
  },

  cardContent: {
    padding: 20,
    paddingLeft: 24, // Account for priority strip
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestampText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },

  // Content Section
  contentSection: {
    flexDirection: "row",
    gap: 16,
  },

  // Image Container
  imageContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.border,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  priorityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Text Content
  textContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: Colors.tertiary,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Card Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTimeText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.tertiary,
    textAlign: "center",
  },
}) 