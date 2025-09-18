import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

export default function BackendTestScreen() {
  const [name, setName] = useState<string>('');
  
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Backend Test</Text>
      <Text style={styles.subtitle}>Test your tRPC backend connection</Text>
      
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
      
      <Text style={styles.info}>
        This will call the backend API at /api/trpc/example.hi
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
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