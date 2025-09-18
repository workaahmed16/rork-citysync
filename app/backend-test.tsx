import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';

export default function BackendTestScreen() {
  const [name, setName] = useState<string>('');
  const [testEmail, setTestEmail] = useState<string>('test@example.com');
  const [testPassword, setTestPassword] = useState<string>('password123');
  const { user, firebaseUser, isLoading, login, register } = useAuth();
  
  const hiMutation = trpc.example.hi.useMutation({
    onSuccess: (data) => {
      if (Platform.OS === 'web') {
        console.log('Success!', `Backend says: ${data.hello} at ${data.date}`);
      } else {
        Alert.alert('Success!', `Backend says: ${data.hello} at ${data.date}`);
      }
    },
    onError: (error) => {
      if (Platform.OS === 'web') {
        console.error('Error', error.message);
      } else {
        Alert.alert('Error', error.message);
      }
    },
  });

  const handleTest = () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        console.error('Error', 'Please enter a name');
      } else {
        Alert.alert('Error', 'Please enter a name');
      }
      return;
    }
    hiMutation.mutate({ name: name.trim() });
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
            style={[styles.button, hiMutation.isPending && styles.buttonDisabled]} 
            onPress={handleTest}
            disabled={hiMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {hiMutation.isPending ? 'Testing...' : 'Test Backend'}
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