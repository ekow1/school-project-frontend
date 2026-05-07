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

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', accent: '#7C2D12', success: '#10B981', warning: '#E8A020' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const TABS = ["All", "Incidents", "Safety", "Others"]
const SCREEN_WIDTH = Dimensions.get("window").width

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
      return NB.primary
    case "Safety":
      return NB.success
    case "Others":
      return NB.accent
    default:
      return NB.muted
  }
}

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case "high":
      return { color: NB.primary, icon: "flame" }
    case "medium":
      return { color: NB.warning, icon: "warning" }
    case "low":
      return { color: NB.success, icon: "information-circle" }
    default:
      return { color: NB.muted, icon: "radio" }
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
                  <Ionicons name="time-outline" size={12} color={NB.muted} />
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
                    <Ionicons name={priorityInfo.icon as any} size={12} color={priorityInfo.color} />
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
                      <Ionicons name="radio-outline" size={14} color={NB.muted} />
                      <Text style={styles.sourceText}>{news.source}</Text>
                    </View>

                    <View style={styles.readTimeContainer}>
                      <Ionicons name="book-outline" size={12} color={NB.muted} />
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
          <Ionicons name="newspaper-outline" size={48} color={NB.muted} />
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
      <StatusBar barStyle="dark-content" backgroundColor={NB.bg} />
      <AnimatedScreen direction="up" delay={100}>
        <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.headerBlock}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Fire News & Updates</Text>
            <Text style={styles.headerSubtitle}>Stay informed with the latest fire safety news</Text>
          </View>
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
    backgroundColor: NB.bg,
  },
  container: {
    flex: 1,
    backgroundColor: NB.bg,
  },

  // Header Styles
  headerBlock: {
    backgroundColor: NB.surface,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NB.border,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: NB.muted,
    fontWeight: "600",
  },

  // Enhanced Tab Bar
  topBar: {
    backgroundColor: NB.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: NB.border,
    backgroundColor: NB.bg,
  },
  activeTab: {
    backgroundColor: NB.primary,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    color: NB.muted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "800",
  },
  tabIndicator: {
    display: "none",
  },

  // News List
  newsList: {
    padding: 20,
    gap: 16,
  },

  // Enhanced News Card
  newsCard: {
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    overflow: "hidden",
    position: "relative",
    ...nbShadow,
  },

  priorityStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    zIndex: 1,
  },

  cardContent: {
    padding: 14,
    paddingLeft: 18,
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: NB.border,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestampText: {
    fontSize: 11,
    color: NB.muted,
    fontWeight: "600",
  },

  // Content Section
  contentSection: {
    flexDirection: "row",
    gap: 12,
  },

  // Image Container
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: NB.border,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
    backgroundColor: NB.bg,
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
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: NB.border,
    backgroundColor: NB.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  // Text Content
  textContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: NB.border,
    lineHeight: 20,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 12,
    color: NB.muted,
    lineHeight: 18,
    marginBottom: 8,
  },

  // Card Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: NB.border,
    paddingTop: 8,
    marginTop: "auto",
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    color: NB.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: NB.muted,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "800",
    color: NB.border,
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: NB.muted,
    textAlign: "center",
  },
}) 