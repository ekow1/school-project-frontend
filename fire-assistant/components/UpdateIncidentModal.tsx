import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FireReport, UpdateFireReportData, useFireReportsStore } from '../store/fireReportsStore';

interface UpdateIncidentModalProps {
  visible: boolean;
  incident: FireReport | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceVariant: "#F1F5F9",
  border: "#E2E8F0",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export default function UpdateIncidentModal({
  visible,
  incident,
  onClose,
  onUpdateSuccess,
}: UpdateIncidentModalProps) {
  const { updateFireReport, isUpdating } = useFireReportsStore();
  
  const [incidentName, setIncidentName] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'resolved' | 'cancelled'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (incident) {
      setIncidentName(incident.incidentName || '');
      setStatus(incident.status || 'pending');
      setPriority(incident.priority || 'medium');
      setDescription(incident.description || '');
    }
  }, [incident]);

  const handleUpdate = async () => {
    if (!incident) return;

    if (!incidentName.trim()) {
      Alert.alert('Error', 'Please enter an incident name');
      return;
    }

    try {
      const updateData: UpdateFireReportData = {
        incidentName: incidentName.trim(),
        status,
        priority,
        description: description.trim() || undefined,
      };

      await updateFireReport(incident._id, updateData);
      
      Alert.alert(
        'Success',
        'Incident updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onUpdateSuccess?.();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update incident. Please try again.'
      );
    }
  };

  const statusOptions: Array<{ value: 'pending' | 'in-progress' | 'resolved' | 'cancelled'; label: string; color: string }> = [
    { value: 'pending', label: 'Pending', color: '#F59E0B' },
    { value: 'in-progress', label: 'In Progress', color: '#3B82F6' },
    { value: 'resolved', label: 'Resolved', color: '#10B981' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
  ];

  const priorityOptions: Array<{ value: 'low' | 'medium' | 'high'; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#6B7280' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
  ];

  if (!incident) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Incident</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Incident Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Incident Name</Text>
              <TextInput
                style={styles.input}
                value={incidentName}
                onChangeText={setIncidentName}
                placeholder="Enter incident name"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Incident Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Incident Type</Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>{incident.incidentType.toUpperCase()}</Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.optionsContainer}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      status === option.value && [
                        styles.optionButtonSelected,
                        { borderColor: option.color, backgroundColor: option.color + '15' },
                      ],
                    ]}
                    onPress={() => setStatus(option.value)}
                  >
                    <View style={[styles.optionIndicator, { backgroundColor: option.color }]} />
                    <Text
                      style={[
                        styles.optionText,
                        status === option.value && { color: option.color, fontWeight: '600' },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.optionsContainer}>
                {priorityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      priority === option.value && [
                        styles.optionButtonSelected,
                        { borderColor: option.color, backgroundColor: option.color + '15' },
                      ],
                    ]}
                    onPress={() => setPriority(option.value)}
                  >
                    <View style={[styles.optionIndicator, { backgroundColor: option.color }]} />
                    <Text
                      style={[
                        styles.optionText,
                        priority === option.value && { color: option.color, fontWeight: '600' },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter incident description"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Location Info (Read-only) */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{incident.location?.locationName || 'Unknown location'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="business" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{incident.station?.name || 'Unknown station'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {new Date(incident.reportedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isUpdating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.updateButtonText}>Update Incident</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  disabledInput: {
    backgroundColor: Colors.surfaceVariant,
    opacity: 0.7,
  },
  disabledText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
    minWidth: 100,
  },
  optionButtonSelected: {
    borderWidth: 2,
  },
  optionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

