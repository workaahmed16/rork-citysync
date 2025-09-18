import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  size = 16, 
  interactive = false, 
  onRatingChange 
}: StarRatingProps) {
  const handleStarPress = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => {
        const StarComponent = interactive ? TouchableOpacity : View;
        
        return (
          <StarComponent
            key={star}
            style={interactive ? styles.interactiveStar : undefined}
            onPress={() => handleStarPress(star)}
            disabled={!interactive}
          >
            <Star
              size={size}
              color={star <= rating ? Colors.light.warning : Colors.light.tabIconDefault}
              fill={star <= rating ? Colors.light.warning : 'transparent'}
            />
          </StarComponent>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  interactiveStar: {
    padding: 4,
  },
});