import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MapPin, Plus, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocations } from '@/contexts/locations-context';
import ReviewCard from '@/components/ReviewCard';
import StarRating from '@/components/StarRating';
import Colors from '@/constants/colors';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLocationById, getLocationReviews } = useLocations();
  const insets = useSafeAreaInsets();
  
  const location = getLocationById(id);
  const reviews = getLocationReviews(id);

  if (!location) {
    return (
      <>
        <Stack.Screen options={{ title: 'Location Not Found' }} />
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Location not found</Text>
          </View>
        </View>
      </>
    );
  }

  const handleAddReview = () => {
    router.push(`/add-review?locationId=${location.id}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: location.name, headerBackTitle: 'Back' }} />
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView style={styles.content}>
          {location.image && (
            <Image source={{ uri: location.image }} style={styles.heroImage} />
          )}
          
          <View style={styles.locationInfo}>
            <View style={styles.header}>
              <View style={styles.titleSection}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.category}>{location.category}</Text>
              </View>
              <TouchableOpacity style={styles.addReviewButton} onPress={handleAddReview}>
                <Plus color={Colors.light.background} size={20} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.addressRow}>
              <MapPin size={16} color={Colors.light.textSecondary} />
              <Text style={styles.address}>{location.address}</Text>
            </View>
            
            <View style={styles.ratingSection}>
              <StarRating rating={location.averageRating} size={20} />
              <Text style={styles.ratingText}>
                {location.averageRating.toFixed(1)} ({location.totalReviews} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Reviews</Text>
              <TouchableOpacity style={styles.writeReviewButton} onPress={handleAddReview}>
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>
            
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <View style={styles.noReviewsContainer}>
                <Star color={Colors.light.textSecondary} size={48} />
                <Text style={styles.noReviewsTitle}>No reviews yet</Text>
                <Text style={styles.noReviewsText}>
                  Be the first to share your experience!
                </Text>
                <TouchableOpacity style={styles.firstReviewButton} onPress={handleAddReview}>
                  <Text style={styles.firstReviewButtonText}>Write First Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  locationInfo: {
    backgroundColor: Colors.light.background,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  addReviewButton: {
    backgroundColor: Colors.light.tint,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  address: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  reviewsSection: {
    flex: 1,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    marginBottom: 8,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  writeReviewButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  noReviewsContainer: {
    backgroundColor: Colors.light.background,
    margin: 16,
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  noReviewsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewsText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  firstReviewButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  firstReviewButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
});