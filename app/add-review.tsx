import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Star, Camera } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';
import { useLocations } from '@/contexts/locations-context';
import StarRating from '@/components/StarRating';
import Colors from '@/constants/colors';

export default function AddReviewScreen() {
  const { locationId } = useLocalSearchParams<{ locationId?: string }>();
  const { user } = useAuth();
  const { locations, addReview } = useLocations();
  
  const [selectedLocationId, setSelectedLocationId] = useState(locationId || '');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to write a review');
      return;
    }

    if (!selectedLocationId) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        locationId: selectedLocationId,
        rating,
        text: reviewText.trim(),
      });
      
      Alert.alert('Success', 'Review added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: 'Add Review' }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.authPrompt}>
            <Star color={Colors.light.textSecondary} size={48} />
            <Text style={styles.authTitle}>Sign In Required</Text>
            <Text style={styles.authSubtitle}>
              Please sign in to write a review
            </Text>
            <TouchableOpacity 
              style={styles.authButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.authButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Review', headerBackTitle: 'Back' }} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.content}>
            {!locationId && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Location</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationsList}>
                  {locations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={[
                        styles.locationChip,
                        selectedLocationId === location.id && styles.locationChipSelected
                      ]}
                      onPress={() => setSelectedLocationId(location.id)}
                    >
                      <Text style={[
                        styles.locationChipText,
                        selectedLocationId === location.id && styles.locationChipTextSelected
                      ]}>
                        {location.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedLocation && (
              <View style={styles.selectedLocationCard}>
                <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
                <Text style={styles.selectedLocationAddress}>{selectedLocation.address}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rating</Text>
              <View style={styles.ratingContainer}>
                <StarRating 
                  rating={rating} 
                  size={32} 
                  interactive 
                  onRatingChange={setRating}
                />
                <Text style={styles.ratingText}>
                  {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Tap to rate'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos (Coming Soon)</Text>
              <TouchableOpacity style={styles.photoButton} disabled>
                <Camera color={Colors.light.textSecondary} size={24} />
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Publishing...' : 'Publish Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  locationsList: {
    flexDirection: 'row',
  },
  locationChip: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  locationChipSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  locationChipText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  locationChipTextSelected: {
    color: Colors.light.background,
  },
  selectedLocationCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  selectedLocationName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  selectedLocationAddress: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 24,
    borderRadius: 12,
    gap: 16,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  reviewInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  photoButton: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  photoButtonText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
});