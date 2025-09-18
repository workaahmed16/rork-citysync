import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import type { Location } from '@/types';
import Colors from '@/constants/colors';

interface MapMarkerProps {
  location: Location;
  onPress: () => void;
}

export default function MapMarker({ location, onPress }: MapMarkerProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant': return '#FF6B6B';
      case 'park': return '#4ECDC4';
      case 'museum': return '#45B7D1';
      case 'landmark': return '#96CEB4';
      default: return Colors.light.tint;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.marker, { backgroundColor: getCategoryColor(location.category) }]}>
        <MapPin color="white" size={16} />
      </View>
      <View style={styles.callout}>
        <Text style={styles.name} numberOfLines={1}>{location.name}</Text>
        <View style={styles.rating}>
          <Star color={Colors.light.warning} size={12} fill={Colors.light.warning} />
          <Text style={styles.ratingText}>{location.averageRating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  callout: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});