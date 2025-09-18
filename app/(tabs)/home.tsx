import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
} from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useLocations } from '@/contexts/locations-context';
import LocationCard from '@/components/LocationCard';
import ReviewCard from '@/components/ReviewCard';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const { locations, getRecentReviews, searchLocations, getLocationById } = useLocations();
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const recentReviews = getRecentReviews();
  const filteredLocations = searchLocations(searchQuery);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Welcome to CitySync</Text>
          <Text style={styles.authSubtitle}>
            Discover and share amazing places in your city
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.authButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>CitySync</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-review')}
        >
          <Plus color={Colors.light.background} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={Colors.light.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {searchQuery ? (
          <View>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {filteredLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
            {filteredLocations.length === 0 && (
              <Text style={styles.emptyText}>No places found</Text>
            )}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              {recentReviews.map((review) => {
                const location = getLocationById(review.locationId);
                return (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    locationName={location?.name}
                  />
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Discover Places</Text>
              {locations.slice(0, 5).map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: 16,
    marginTop: 32,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
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