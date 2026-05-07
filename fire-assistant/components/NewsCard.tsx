import { Ionicons } from "@expo/vector-icons"
import React from "react"
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  primaryDark: "#9A0007",
  primaryAlpha: "rgba(211, 47, 47, 0.1)",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceVariant: "#F1F5F9",
  border: "#1A1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#8B5CF6",
  shadow: "rgba(0, 0, 0, 0.1)",
}

const nbShadow = { shadowColor: Colors.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

interface NewsItem {
  title: string
  summary: string
  image: string
  source: string
  timestamp: string
  url: string
  category: string
}

interface NewsCardProps {
  news: NewsItem[]
  onNewsPress?: (news: NewsItem) => void
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onNewsPress,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "emergency":
        return Colors.danger
      case "safety":
        return Colors.success
      case "update":
        return Colors.accent
      default:
        return Colors.primary
    }
  }

  return (
    <View style={styles.newsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="newspaper" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Latest News</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.newsHorizontalContainer}>
        {news.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.newsCard}
            onPress={() => onNewsPress?.(item)}
            activeOpacity={0.8}
          >
            <View style={styles.newsImageContainer}>
              <Image source={{ uri: item.image }} style={styles.newsImage} />
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.newsSummary} numberOfLines={3}>
                {item.summary}
              </Text>
              <View style={styles.newsMeta}>
                <Text style={styles.newsSource}>{item.source}</Text>
                <Text style={styles.newsTimestamp}>{item.timestamp}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  newsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    ...nbShadow,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: Colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  newsHorizontalContainer: {
    paddingHorizontal: 20,
  },
  newsCard: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 16,
    ...nbShadow,
    overflow: "hidden",
  },
  newsImageContainer: {
    position: "relative",
  },
  newsImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: Colors.tertiary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsSource: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  newsTimestamp: {
    fontSize: 12,
    color: Colors.tertiary,
  },
})

export default NewsCard 