import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      await AsyncStorage.setItem('token', response.data.token);
      navigation.replace('Browse');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skill Swap</Text>
      <Text style={styles.subtitle}>Connect. Learn. Grow.</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "Logging in..." : "Login"} 
          onPress={handleLogin} 
          disabled={loading} 
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Create Account" 
          onPress={() => navigation.navigate('Register')}
          color="#6c757d"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 5
  },
  email: { 
    color: '#6c757d',
    fontSize: 14
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  bio: { 
    fontSize: 14,
    color: '#495057',
    lineHeight: 20
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skillBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  wantedBadge: {
    backgroundColor: '#28a745'
  },
  skillText: {
    color: '#fff',
    fontSize: 13
  },
  emptyText: {
    color: '#adb5bd',
    fontSize: 14,
    fontStyle: 'italic'
  },
  buttonContainer: {
    margin: 20
  }
});