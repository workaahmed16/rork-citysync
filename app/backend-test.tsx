import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpcClient } from '@/lib/trpc';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';

export default function BackendTestScreen() {
  const [name, setName] = useState<string>('');
  const [testEmail, setTestEmail] = useState<string>('test@example.com');
  const [testPassword, setTestPassword] = useState<string>('password123');
  const [testProfileName, setTestProfileName] = useState<string>('Test Profile Name');
  const [testBio, setTestBio] = useState<string>('This is a test bio');
  const { user, firebaseUser, isLoading, login, register, updateProfile } = useAuth();
  
  const [isTestingBackend, setIsTestingBackend] = useState<boolean>(false);
  const [isTestingHealth, setIsTestingHealth] = useState<boolean>(false);

  const handleHealthCheck = async () => {
    setIsTestingHealth(true);
    try {
      const baseUrl = __DEV__ ? 
        (Platform.OS === 'web' ? 'http://localhost:3000' : 
         Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000') : 
        process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
      
      console.log('Testing health check at:', `${baseUrl}/api/health`);
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      
      console.log('Health check result:', data);
      const message = `Health check successful: ${data.message}`;
      if (Platform.OS === 'web') {
        console.log('Success!', message);
      } else {
        Alert.alert('Success!', message);
      }
    } catch (error: any) {
      console.error('Health check error:', error);
      const message = `Health check failed: ${error.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        console.error('Error', message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsTestingHealth(false);
    }
  };

  const handleTest = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        console.error('Error', 'Please enter a name');
      } else {
        Alert.alert('Error', 'Please enter a name');
      }
      return;
    }
    
    setIsTestingBackend(true);
    try {
      console.log('Testing backend with name:', name.trim());
      const result = await trpcClient.example.hi.query({ name: name.trim() });
      console.log('Backend test result:', result);
      
      const message = `Backend says: ${result.hello} at ${result.date}`;
      if (Platform.OS === 'web') {
        console.log('Success!', message);
      } else {
        Alert.alert('Success!', message);
      }
    } catch (error: any) {
      console.error('Backend test error:', error);
      const message = `Backend test failed: ${error.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        console.error('Error', message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleDebugTest = async () => {
    setIsTestingBackend(true);
    try {
      console.log('Testing debug endpoint...');
      const result = await trpcClient.debug.query();
      console.log('Debug test result:', result);
      
      const message = `Debug: ${result.message}\nRoutes: ${JSON.stringify(result.routes, null, 2)}`;
      if (Platform.OS === 'web') {
        console.log('Success!', message);
      } else {
        Alert.alert('Success!', message);
      }
    } catch (error: any) {
      console.error('Debug test error:', error);
      const message = `Debug test failed: ${error.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        console.error('Error', message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleGetProfileTest = async () => {
    if (!user || !firebaseUser) {
      const message = 'Please login first to test getProfile';
      if (Platform.OS === 'web') {
        console.error(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setIsTestingBackend(true);
    try {
      console.log('Testing getProfile...');
      const result = await trpcClient.user.getProfile.query();
      console.log('getProfile result:', result);
      
      const message = `Profile data: ${JSON.stringify(result, null, 2)}`;
      if (Platform.OS === 'web') {
        console.log('Success!', message);
      } else {
        Alert.alert('Success!', message);
      }
    } catch (error: any) {
      console.error('getProfile error:', error);
      const message = `getProfile failed: ${error.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        console.error('Error', message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleTestGetProfileTest = async () => {
    setIsTestingBackend(true);
    try {
      console.log('Testing testGetProfile (public)...');
      const result = await trpcClient.user.testGetProfile.query();
      console.log('testGetProfile result:', result);
      
      const message = `Test Profile data: ${JSON.stringify(result, null, 2)}`;
      if (Platform.OS === 'web') {
        console.log('Success!', message);
      } else {
        Alert.alert('Success!', message);
      }
    } catch (error: any) {
      console.error('testGetProfile error:', error);
      const message = `testGetProfile failed: ${error.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        console.error('Error', message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleTestLogin = async () => {
    console.log('Testing login with:', testEmail);
    const success = await login(testEmail, testPassword);
    const message = success ? 'Login successful!' : 'Login failed!';
    if (Platform.OS === 'web') {
      console.log(message);
    } else {
      Alert.alert('Login Test', message);
    }
  };

  const handleTestRegister = async () => {
    console.log('Testing registration with:', testEmail);
    const success = await register(testEmail, testPassword, 'Test User');
    const message = success ? 'Registration successful!' : 'Registration failed!';
    if (Platform.OS === 'web') {
      console.log(message);
    } else {
      Alert.alert('Registration Test', message);
    }
  };

  const handleTestProfileUpdate = async () => {
    if (!user || !firebaseUser) {
      const message = 'Please login first to test profile update';
      if (Platform.OS === 'web') {
        console.error(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    try {
      console.log('Testing profile update...');
      const result = await updateProfile({
        name: testProfileName,
        bio: testBio,
        hobbies: ['Testing', 'Debugging'],
        interests: ['React Native', 'Firebase'],
        city: 'Test City',
        country: 'Test Country'
      });
      
      console.log('Profile update result:', result);
      const message = 'Profile update successful!';
      if (Platform.OS === 'web') {
        console.log(message);
      } else {
        Alert.alert('Success', message);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = `Profile update failed: ${error.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        console.error(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Backend & Auth Test</Text>
        <Text style={styles.subtitle}>Test your tRPC backend and Firebase Auth</Text>
        
        {/* Auth Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth Status</Text>
          <Text style={styles.statusText}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.statusText}>Firebase User: {firebaseUser ? firebaseUser.email : 'None'}</Text>
          <Text style={styles.statusText}>App User: {user ? user.name : 'None'}</Text>
          <Text style={styles.statusText}>Auth Instance: {auth ? 'Initialized' : 'Not initialized'}</Text>
        </View>
        
        {/* Backend Health Check */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Health Check</Text>
          <TouchableOpacity 
            style={[styles.button, isTestingHealth && styles.buttonDisabled]} 
            onPress={handleHealthCheck}
            disabled={isTestingHealth}
          >
            <Text style={styles.buttonText}>
              {isTestingHealth ? 'Checking...' : 'Test Backend Connection'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* tRPC Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tRPC Test</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          
          <TouchableOpacity 
            style={[styles.button, isTestingBackend && styles.buttonDisabled]} 
            onPress={handleTest}
            disabled={isTestingBackend}
          >
            <Text style={styles.buttonText}>
              {isTestingBackend ? 'Testing...' : 'Test tRPC Hi'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isTestingBackend && styles.buttonDisabled]} 
            onPress={handleDebugTest}
            disabled={isTestingBackend}
          >
            <Text style={styles.buttonText}>
              {isTestingBackend ? 'Testing...' : 'Test Debug Route'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Auth Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase Auth Test</Text>
          <TextInput
            style={styles.input}
            placeholder="Test email"
            value={testEmail}
            onChangeText={setTestEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Test password"
            value={testPassword}
            onChangeText={setTestPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleTestRegister}
          >
            <Text style={styles.buttonText}>Test Register</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleTestLogin}
          >
            <Text style={styles.buttonText}>Test Login</Text>
          </TouchableOpacity>
        </View>
        
        {/* Profile Update Test */}
        {user && firebaseUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Update Test</Text>
            <TextInput
              style={styles.input}
              placeholder="Test profile name"
              value={testProfileName}
              onChangeText={setTestProfileName}
            />
            <TextInput
              style={styles.input}
              placeholder="Test bio"
              value={testBio}
              onChangeText={setTestBio}
              multiline
            />
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleTestGetProfileTest}
            >
              <Text style={styles.buttonText}>Test Get Profile (Public)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleGetProfileTest}
            >
              <Text style={styles.buttonText}>Test Get Profile (Protected)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleTestProfileUpdate}
            >
              <Text style={styles.buttonText}>Test Profile Update</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.info}>
          This will test both tRPC backend and Firebase Auth
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
});