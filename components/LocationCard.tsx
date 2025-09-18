import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import type { Location } from '@/types';
import StarRating from './StarRating';
import Colors from '@/constants/colors';

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  const handlePress = () => {
    router.push(`/location/${location.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {location.image && (
        <Image source={{ uri: location.image }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{location.name}</Text>
          <Text style={styles.category}>{location.category}</Text>
        </View>
        
        <View style={styles.addressRow}>
          <MapPin size={14} color={Colors.light.textSecondary} />
          <Text style={styles.address} numberOfLines={1}>{location.address}</Text>
        </View>
        
        <View style={styles.ratingRow}>
          <StarRating rating={location.averageRating} size={14} />
          <Text style={styles.ratingText}>
            {location.averageRating.toFixed(1)} ({location.totalReviews} reviews)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  addressRow: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});