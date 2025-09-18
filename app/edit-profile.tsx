import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, Plus, X, Save } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';
import { useLocationPermission } from '@/contexts/location-permission-context';
import Colors from '@/constants/colors';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { userCity, userCountry, updateUserLocation, requestLocationPermission, isLoadingLocation, locationError, clearLocationError, detectAndSetLocation } = useLocationPermission();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [hobbies, setHobbies] = useState<string[]>(user?.hobbies || []);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [city, setCity] = useState(user?.city || userCity || '');
  const [country, setCountry] = useState(user?.country || userCountry || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || user?.photo || '');
  const [newHobby, setNewHobby] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image picker is not available on web. Please use a mobile device.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleAddHobby = () => {
    if (!newHobby.trim()) return;
    
    if (newHobby.length > 50) {
      Alert.alert('Error', 'Hobby name is too long (max 50 characters)');
      return;
    }
    
    if (hobbies.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 hobbies');
      return;
    }
    
    const sanitizedHobby = newHobby.trim();
    if (!hobbies.includes(sanitizedHobby)) {
      setHobbies([...hobbies, sanitizedHobby]);
      setNewHobby('');
    }
  };

  const handleRemoveHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    if (newInterest.length > 50) {
      Alert.alert('Error', 'Interest name is too long (max 50 characters)');
      return;
    }
    
    if (interests.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 interests');
      return;
    }
    
    const sanitizedInterest = newInterest.trim();
    if (!interests.includes(sanitizedInterest)) {
      setInterests([...interests, sanitizedInterest]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleLocationPermission = async () => {
    clearLocationError();
    try {
      const result = await detectAndSetLocation();
      if (result) {
        setCity(result.city);
        setCountry(result.country);
        if (Platform.OS === 'web') {
          console.log(`Profile updated with current location: ${result.city}, ${result.country}`);
        } else {
          Alert.alert('Success', `Profile updated with current location: ${result.city}, ${result.country}`);
        }
      } else if (!isLoadingLocation && locationError) {
        if (Platform.OS === 'web') {
          console.log(locationError);
        } else {
          Alert.alert('Location Error', locationError);
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      if (Platform.OS === 'web') {
        console.log('Unable to detect your location. Please try again or enter it manually.');
      } else {
        Alert.alert('Error', 'Unable to detect your location. Please try again or enter it manually.');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (name.length > 100) {
      Alert.alert('Error', 'Name is too long (max 100 characters)');
      return;
    }

    if (bio.length > 500) {
      Alert.alert('Error', 'Bio is too long (max 500 characters)');
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedName = name.trim();
      const sanitizedBio = bio.trim();
      const sanitizedCity = city.trim();
      const sanitizedCountry = country.trim();

      await updateProfile({
        name: sanitizedName,
        bio: sanitizedBio,
        hobbies,
        interests,
        city: sanitizedCity,
        country: sanitizedCountry,
        profilePhoto,
        photo: profilePhoto,
        location: sanitizedCity && sanitizedCountry ? {
          latitude: 0, // Will be updated by location detection
          longitude: 0
        } : undefined,
      });

      if (sanitizedCity && sanitizedCountry) {
        await updateUserLocation(sanitizedCity, sanitizedCountry);
      }

      if (Platform.OS === 'web') {
        console.log(`Profile saved. Centering map to ${sanitizedCity}, ${sanitizedCountry}`);
      } else {
        Alert.alert('Profile Saved', `Profile updated${sanitizedCity && sanitizedCountry ? ` with location: ${sanitizedCity}, ${sanitizedCountry}` : ''}`);
      }

      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            >
              <Save color={isLoading ? Colors.light.textSecondary : Colors.light.tint} size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={handleImagePicker}>
              {profilePhoto && profilePhoto.trim() ? (
                <Image 
                  source={{ uri: profilePhoto }} 
                  style={styles.profileImage}
                  defaultSource={require('@/assets/images/icon.png')}
                  onError={() => {
                    console.log('Profile image failed to load, clearing invalid URL');
                    setProfilePhoto('');
                  }}
                />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Camera color={Colors.light.textSecondary} size={32} />
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Camera color={Colors.light.background} size={16} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your display name"
              placeholderTextColor={Colors.light.textSecondary}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{bio.length}/500</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleLocationPermission}
              disabled={isLoadingLocation}
            >
              <MapPin color={Colors.light.tint} size={16} />
              <Text style={styles.locationButtonText}>
                {isLoadingLocation ? 'Detecting...' : 'Auto-detect'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {locationError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{locationError}</Text>
            </View>
          )}
          
          <View style={styles.locationRow}>
            <View style={[styles.inputGroup, styles.locationInput]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  if (locationError) clearLocationError();
                }}
                placeholder="Enter your city"
                placeholderTextColor={Colors.light.textSecondary}
                maxLength={100}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.locationInput]}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.textInput}
                value={country}
                onChangeText={(text) => {
                  setCountry(text);
                  if (locationError) clearLocationError();
                }}
                placeholder="Enter your country"
                placeholderTextColor={Colors.light.textSecondary}
                maxLength={100}
              />
            </View>
          </View>
        </View>

        {/* Hobbies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hobbies</Text>
          
          <View style={styles.addHobbyContainer}>
            <TextInput
              style={[styles.textInput, styles.hobbyInput]}
              value={newHobby}
              onChangeText={setNewHobby}
              placeholder="Add a hobby..."
              placeholderTextColor={Colors.light.textSecondary}
              maxLength={50}
              onSubmitEditing={handleAddHobby}
            />
            <TouchableOpacity
              style={styles.addHobbyButton}
              onPress={handleAddHobby}
              disabled={!newHobby.trim()}
            >
              <Plus color={Colors.light.background} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.hobbiesContainer}>
            {hobbies.map((hobby, index) => (
              <View key={`${hobby}-${index}`} style={styles.hobbyTag}>
                <Text style={styles.hobbyText}>{hobby}</Text>
                <TouchableOpacity
                  style={styles.removeHobbyButton}
                  onPress={() => handleRemoveHobby(index)}
                >
                  <X color={Colors.light.textSecondary} size={14} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {hobbies.length === 0 && (
            <Text style={styles.emptyText}>No hobbies added yet</Text>
          )}
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          
          <View style={styles.addHobbyContainer}>
            <TextInput
              style={[styles.textInput, styles.hobbyInput]}
              value={newInterest}
              onChangeText={setNewInterest}
              placeholder="Add an interest..."
              placeholderTextColor={Colors.light.textSecondary}
              maxLength={50}
              onSubmitEditing={handleAddInterest}
            />
            <TouchableOpacity
              style={styles.addHobbyButton}
              onPress={handleAddInterest}
              disabled={!newInterest.trim()}
            >
              <Plus color={Colors.light.background} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.hobbiesContainer}>
            {interests.map((interest, index) => (
              <View key={`${interest}-${index}`} style={styles.hobbyTag}>
                <Text style={styles.hobbyText}>{interest}</Text>
                <TouchableOpacity
                  style={styles.removeHobbyButton}
                  onPress={() => handleRemoveInterest(index)}
                >
                  <X color={Colors.light.textSecondary} size={14} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {interests.length === 0 && (
            <Text style={styles.emptyText}>No interests added yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
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
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  section: {
    backgroundColor: Colors.light.background,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoButton: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.tint + '11',
    borderRadius: 16,
  },
  locationButtonText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
  addHobbyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  hobbyInput: {
    flex: 1,
  },
  addHobbyButton: {
    backgroundColor: Colors.light.tint,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  hobbyText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  removeHobbyButton: {
    padding: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: Colors.light.error + '11',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.error + '33',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    textAlign: 'center',
  },
});