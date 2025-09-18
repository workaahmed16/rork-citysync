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
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const {
    userCity,
    userCountry,
    updateUserLocation,
    isLoadingLocation,
    locationError,
    clearLocationError,
    detectAndSetLocation,
  } = useLocationPermission();

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

  // Pick profile image
  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image picker is only available on mobile.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Grant camera roll permissions to upload a profile photo.');
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
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  // Hobbies / Interests handlers
  const handleAddItem = (item: string, list: string[], setter: (arr: string[]) => void, max = 10) => {
    const sanitized = item.trim();
    if (!sanitized) return;
    if (sanitized.length > 50) return Alert.alert('Error', 'Too long (max 50 chars)');
    if (list.includes(sanitized)) return;
    if (list.length >= max) return Alert.alert('Limit Reached', `Max ${max} items allowed`);
    setter([...list, sanitized]);
  };

  const handleRemoveItem = (index: number, list: string[], setter: (arr: string[]) => void) => {
    setter(list.filter((_, i) => i !== index));
  };

  // Detect location
  const handleLocationPermission = async () => {
    clearLocationError();
    try {
      const loc = await detectAndSetLocation();
      if (loc) {
        setCity(loc.city);
        setCountry(loc.country);
        Alert.alert('Success', `Location detected: ${loc.city}, ${loc.country}`);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Unable to detect location.');
    }
  };

  // Save profile
  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required');
    if (name.length > 100) return Alert.alert('Error', 'Name too long (max 100)');
    if (bio.length > 500) return Alert.alert('Error', 'Bio too long (max 500)');

    setIsLoading(true);
    try {
      const sanitizedCity = city.trim();
      const sanitizedCountry = country.trim();

      let locationData;
      try {
        const loc = await detectAndSetLocation();
        if (loc) locationData = { latitude: loc.lat, longitude: loc.lon };
      } catch {}

      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        hobbies,
        interests,
        city: sanitizedCity,
        country: sanitizedCountry,
        profilePhoto,
        photo: profilePhoto,
        location: locationData || undefined,
      });

      if (sanitizedCity && sanitizedCountry) {
        await updateUserLocation(sanitizedCity, sanitizedCountry);
      }

      Alert.alert('Profile Saved', `Updated${sanitizedCity && sanitizedCountry ? ` with location: ${sanitizedCity}, ${sanitizedCountry}` : ''}`);
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to update profile.');
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
            <TouchableOpacity onPress={handleSave} disabled={isLoading} style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
              <Save color={isLoading ? Colors.light.textSecondary : Colors.light.tint} size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={handleImagePicker}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.profileImage}
                  onError={() => setProfilePhoto('')}
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

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput style={styles.textInput} value={name} onChangeText={setName} placeholder="Enter name" placeholderTextColor={Colors.light.textSecondary} maxLength={100} />
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

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.locationButton} onPress={handleLocationPermission} disabled={isLoadingLocation}>
              <MapPin color={Colors.light.tint} size={16} />
              <Text style={styles.locationButtonText}>{isLoadingLocation ? 'Detecting...' : 'Auto-detect'}</Text>
            </TouchableOpacity>
          </View>
          {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
          <View style={styles.locationRow}>
            <TextInput style={[styles.textInput, styles.locationInput]} value={city} onChangeText={(t) => { setCity(t); if (locationError) clearLocationError(); }} placeholder="City" placeholderTextColor={Colors.light.textSecondary} />
            <TextInput style={[styles.textInput, styles.locationInput]} value={country} onChangeText={(t) => { setCountry(t); if (locationError) clearLocationError(); }} placeholder="Country" placeholderTextColor={Colors.light.textSecondary} />
          </View>
        </View>

        {/* Hobbies */}
        <ProfileListSection
          title="Hobbies"
          items={hobbies}
          newItem={newHobby}
          onNewItemChange={setNewHobby}
          onAddItem={() => handleAddItem(newHobby, hobbies, setHobbies)}
          onRemoveItem={(index) => handleRemoveItem(index, hobbies, setHobbies)}
        />

        {/* Interests */}
        <ProfileListSection
          title="Interests"
          items={interests}
          newItem={newInterest}
          onNewItemChange={setNewInterest}
          onAddItem={() => handleAddItem(newInterest, interests, setInterests)}
          onRemoveItem={(index) => handleRemoveItem(index, interests, setInterests)}
        />
      </ScrollView>
    </View>
  );
}

// Reusable component for Hobbies/Interests
function ProfileListSection({
  title,
  items,
  newItem,
  onNewItemChange,
  onAddItem,
  onRemoveItem,
}: {
  title: string;
  items: string[];
  newItem: string;
  onNewItemChange: (text: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.addHobbyContainer}>
        <TextInput
          style={[styles.textInput, styles.hobbyInput]}
          value={newItem}
          onChangeText={onNewItemChange}
          placeholder={`Add a ${title.slice(0, -1).toLowerCase()}...`}
          placeholderTextColor={Colors.light.textSecondary}
          maxLength={50}
          onSubmitEditing={onAddItem}
        />
        <TouchableOpacity style={styles.addHobbyButton} onPress={onAddItem} disabled={!newItem.trim()}>
          <Plus color={Colors.light.background} size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.hobbiesContainer}>
        {items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.hobbyTag}>
            <Text style={styles.hobbyText}>{item}</Text>
            <TouchableOpacity style={styles.removeHobbyButton} onPress={() => onRemoveItem(index)}>
              <X color={Colors.light.textSecondary} size={14} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {items.length === 0 && <Text style={styles.emptyText}>No {title.toLowerCase()} added yet</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundSecondary },
  content: { flex: 1 },
  saveButton: { padding: 8 },
  saveButtonDisabled: { opacity: 0.5 },
  section: { backgroundColor: Colors.light.background, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginBottom: 16 },
  photoContainer: { alignItems: 'center' },
  photoButton: { position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  placeholderPhoto: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.light.backgroundSecondary, justifyContent: 'center', alignItems: 'center' },
  photoOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.light.tint, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.light.background },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: Colors.light.text, marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: Colors.light.border, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.light.text, backgroundColor: Colors.light.background },
  bioInput: { height: 80, textAlignVertical: 'top' },
  characterCount: { fontSize: 12, color: Colors.light.textSecondary, textAlign: 'right', marginTop: 4 },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.light.tint + '11', borderRadius: 16 },
  locationButtonText: { fontSize: 12, color: Colors.light.tint, fontWeight: '500' },
  locationRow: { flexDirection: 'row', gap: 12 },
  locationInput: { flex: 1 },
  addHobbyContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  hobbyInput: { flex: 1 },
  addHobbyButton: { backgroundColor: Colors.light.tint, width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  hobbiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hobbyTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  hobbyText: { fontSize: 14, color: Colors.light.text },
  removeHobbyButton: { padding: 2 },
  emptyText: { fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center', fontStyle: 'italic' },
  errorText: { color: Colors.light.error, fontSize: 14, textAlign: 'center', marginBottom: 8 },
});
