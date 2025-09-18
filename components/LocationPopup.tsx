import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { X, MapPin, MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import type { Location } from '@/types';
import { useLocations } from '@/contexts/locations-context';
import Colors from '@/constants/colors';
import StarRating from './StarRating';

interface LocationPopupProps {
  location: Location;
  onClose: () => void;
}

export default function LocationPopup({ location, onClose }: LocationPopupProps) {
  const { getLocationReviews } = useLocations();
  const reviews = getLocationReviews(location.id);
  const recentReviews = reviews.slice(0, 3);

  const handleViewDetails = () => {
    onClose();
    router.push(`/location/${location.id}`);
  };

  const handleAddReview = () => {
    onClose();
    router.push({
      pathname: '/add-review',
      params: { locationId: location.id, locationName: location.name }
    });
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.popup}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>{location.name}</Text>
            <View style={styles.locationInfo}>
              <MapPin color={Colors.light.textSecondary} size={14} />
              <Text style={styles.address} numberOfLines={1}>{location.address}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <StarRating rating={location.averageRating} size={16} />
              <Text style={styles.ratingText}>
                {location.averageRating.toFixed(1)} ({location.totalReviews} reviews)
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color={Colors.light.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {location.image && (
          <Image source={{ uri: location.image }} style={styles.image} />
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{location.category}</Text>
          </View>

          {recentReviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              {recentReviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <StarRating rating={review.rating} size={12} />
                  </View>
                  <Text style={styles.reviewText} numberOfLines={2}>
                    {review.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddReview}>
            <MessageCircle color={Colors.light.tint} size={18} />
            <Text style={styles.actionButtonText}>Add Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewDetails}>
            <Text style={styles.primaryButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  reviewItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '600',
  },
});