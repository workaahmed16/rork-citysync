import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { Settings, LogOut, Edit, Calendar, Star, MapPin, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useLocations } from '@/contexts/locations-context';
import { useLocationPermission } from '@/contexts/location-permission-context';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { reviews } = useLocations();
  const { hasLocationPermission, requestLocationPermission, userCity, userCountry } = useLocationPermission();
  const insets = useSafeAreaInsets();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

  // Calculate user stats - always call hooks in the same order
  const userReviews = user ? reviews.filter(review => review.userId === user.id) : [];
  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
    : 0;

  // Show location permission prompt on first app launch
  useEffect(() => {
    const checkLocationPermission = async () => {
      if (!hasPromptedLocation && !hasLocationPermission && Platform.OS !== 'web') {
        setShowLocationModal(true);
        setHasPromptedLocation(true);
      }
    };
    
    if (user) {
      checkLocationPermission();
    }
  }, [user, hasLocationPermission, hasPromptedLocation]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = confirm('Are you sure you want to logout?');
      if (confirmed) {
        logout();
      }
    } else {
      logout();
    }
  };

  const handleLocationPermission = async () => {
    try {
      const granted = await requestLocationPermission();
      setShowLocationModal(false);
      if (granted) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied - user can still manually set location in profile');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setShowLocationModal(false);
    }
  };

  const handleLocationDeny = () => {
    setShowLocationModal(false);
    console.log('Location permission denied - user can manually set location in profile settings');
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Join CitySync</Text>
          <Text style={styles.authSubtitle}>
            Create an account to share your favorite places
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
onPress={() => console.log('Settings coming soon')}
        >
          <Settings color={Colors.light.textSecondary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.profilePhoto && user.profilePhoto.trim() ? (
              <Image 
                source={{ uri: user.profilePhoto }} 
                style={styles.avatar}
                defaultSource={require('@/assets/images/icon.png')}
                onError={() => console.log('Profile image failed to load')}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit color={Colors.light.background} size={16} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {(user.city || user.country || userCity || userCountry) && (
            <View style={styles.locationContainer}>
              <MapPin color={Colors.light.textSecondary} size={14} />
              <Text style={styles.locationText}>
                {user.city || userCity}{user.city || userCity ? ', ' : ''}{user.country || userCountry}
              </Text>
            </View>
          )}
          
          {user.bio && (
            <Text style={styles.userBio}>{user.bio}</Text>
          )}
          
          {user.hobbies && user.hobbies.length > 0 && (
            <View style={styles.hobbiesContainer}>
              {user.hobbies.slice(0, 3).map((hobby, index) => (
                <View key={`${hobby}-${index}`} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))}
              {user.hobbies.length > 3 && (
                <View style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>+{user.hobbies.length - 3} more</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.joinDateContainer}>
            <Calendar color={Colors.light.textSecondary} size={16} />
            <Text style={styles.joinDate}>
              Joined {formatJoinDate(user.joinedDate)}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userReviews.length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Star 
                color={Colors.light.warning} 
                fill={Colors.light.warning} 
                size={16} 
              />
              <Text style={styles.statNumber}>
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </Text>
            </View>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('My reviews coming soon')}
          >
            <Star color={Colors.light.textSecondary} size={20} />
            <Text style={styles.menuText}>My Reviews</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Favorites coming soon')}
          >
            <Heart color={Colors.light.textSecondary} size={20} />
            <Text style={styles.menuText}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/edit-profile')}
          >
            <Edit color={Colors.light.textSecondary} size={20} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Settings coming soon')}
          >
            <Settings color={Colors.light.textSecondary} size={20} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <LogOut color={Colors.light.error} size={20} />
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LocationPermissionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onAllow={handleLocationPermission}
        onDeny={handleLocationDeny}
      />
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
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.light.background,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.light.background,
    fontSize: 32,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.textSecondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  userBio: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  joinDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hobbyTag: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hobbyText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuSection: {
    backgroundColor: Colors.light.background,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: Colors.light.error,
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