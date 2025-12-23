import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ENV } from '../../config/env';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  primaryDark: "#9A0007",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceVariant: "#F1F5F9",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#8B5CF6",
};

export default function FeedbackScreen() {
  const { user, token } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [feedbackSubject, setFeedbackSubject] = useState<'app' | 'fire_report' | 'safety'>('app');
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | 'improvement' | 'complaint' | 'compliment'>('general');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackSubjects = [
    { id: 'app', label: 'App', icon: 'phone-portrait-outline', color: Colors.primary },
    { id: 'fire_report', label: 'Fire Report', icon: 'flame-outline', color: Colors.danger },
    { id: 'safety', label: 'Safety', icon: 'shield-checkmark-outline', color: Colors.success },
  ];

  const getFeedbackTypes = () => {
    switch (feedbackSubject) {
      case 'app':
        return [
          { id: 'general', label: 'General Feedback', icon: 'chatbubble-outline' },
          { id: 'bug', label: 'Bug Report', icon: 'bug-outline' },
          { id: 'feature', label: 'Feature Request', icon: 'bulb-outline' },
          { id: 'improvement', label: 'Improvement', icon: 'trending-up-outline' },
        ];
      case 'fire_report':
        return [
          { id: 'general', label: 'General Feedback', icon: 'chatbubble-outline' },
          { id: 'complaint', label: 'Complaint', icon: 'alert-circle-outline' },
          { id: 'compliment', label: 'Compliment', icon: 'thumbs-up-outline' },
          { id: 'improvement', label: 'Improvement', icon: 'trending-up-outline' },
        ];
      case 'safety':
        return [
          { id: 'general', label: 'General Feedback', icon: 'chatbubble-outline' },
          { id: 'complaint', label: 'Safety Concern', icon: 'warning-outline' },
          { id: 'improvement', label: 'Safety Suggestion', icon: 'shield-outline' },
          { id: 'feature', label: 'Feature Request', icon: 'bulb-outline' },
        ];
      default:
        return [];
    }
  };

  const feedbackTypes = getFeedbackTypes();

  const getPlaceholderText = () => {
    switch (feedbackSubject) {
      case 'app':
        return 'Please share your thoughts about the app, report issues, or suggest improvements...';
      case 'fire_report':
        return 'Please share your feedback about the fire report system, response times, or any concerns...';
      case 'safety':
        return 'Please share your safety concerns, suggestions, or feedback about safety measures...';
      default:
        return 'Please share your thoughts, suggestions, or report any issues you encountered...';
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please provide your feedback comment');
      return;
    }

    if (rating === 0) {
      Alert.alert('Error', 'Please rate your experience');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${ENV.AUTH_API_URL}/feedback`,
        {
          rating,
          subject: feedbackSubject,
          type: feedbackType,
          comment: comment.trim(),
          email: email.trim() || undefined,
          userId: user?.id,
          userType: user?.userType || 'regular',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Thank You!',
          'Your feedback has been submitted successfully. We appreciate your input!',
          [
            {
              text: 'OK',
              onPress: () => {
                setRating(0);
                setComment('');
                setFeedbackSubject('app');
                setFeedbackType('general');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      Alert.alert(
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to submit feedback. Please try again.'
          : 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Feedback Subject Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is your feedback about?</Text>
            <View style={styles.subjectContainer}>
              {feedbackSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectButton,
                    feedbackSubject === subject.id && [
                      styles.subjectButtonSelected,
                      { borderColor: subject.color, backgroundColor: subject.color + '15' },
                    ],
                  ]}
                  onPress={() => {
                    setFeedbackSubject(subject.id as any);
                    setFeedbackType('general');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={subject.icon as any}
                    size={24}
                    color={feedbackSubject === subject.id ? subject.color : Colors.tertiary}
                  />
                  <Text
                    style={[
                      styles.subjectButtonText,
                      feedbackSubject === subject.id && { color: subject.color },
                    ]}
                  >
                    {subject.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How would you rate your experience?</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starButton}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? Colors.warning : Colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Text>
            )}
          </View>

          {/* Feedback Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of feedback?</Text>
            <View style={styles.typeContainer}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    feedbackType === type.id && styles.typeButtonSelected,
                  ]}
                  onPress={() => setFeedbackType(type.id as any)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={feedbackType === type.id ? Colors.primary : Colors.tertiary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      feedbackType === type.id && styles.typeButtonTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tell us more about your experience</Text>
            <TextInput
              style={styles.commentInput}
              placeholder={getPlaceholderText()}
              placeholderTextColor={Colors.tertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{comment.length}/1000</Text>
          </View>

          {/* Email Section (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              We may contact you for follow-up if needed
            </Text>
            <TextInput
              style={styles.emailInput}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.tertiary,
    marginBottom: 12,
  },
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  subjectButtonSelected: {
    borderWidth: 2,
  },
  subjectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.tertiary,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
    minWidth: 120,
  },
  typeButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  typeButtonTextSelected: {
    color: Colors.primary,
  },
  commentInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 8,
  },
  emailInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpace: {
    height: 40,
  },
});

