// AuthForm.tsx
import { signIn, signUp } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from './AuthContext';

type AuthFormProps = {
  mode: 'signup' | 'login';
};

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        console.log('AuthForm: Attempting to sign up with username:', username);
        const result = await signUp({
          username,
          password,
          options: {
            userAttributes: {
              name: fullName || username
            }
            // Remove autoSignIn for now to debug the confirmation issue
          }
        });
        
        console.log('AuthForm: Sign up result:', result);
        console.log('AuthForm: Next step:', result.nextStep);
        
        // Handle different signup outcomes
        if (result.nextStep.signUpStep === 'DONE') {
          // User is created and ready to sign in
          console.log('AuthForm: User created successfully, attempting sign in...');
          try {
            const signInResult = await signIn({ username, password });
            console.log('AuthForm: Sign in after signup successful:', signInResult);
            await refreshUser();
            Alert.alert('Success', 'User registered and logged in!');
            router.push('/');
          } catch (signInErr: any) {
            console.error('AuthForm: Sign in after signup failed:', signInErr);
            Alert.alert('Success', 'User registered! Please log in manually.');
            router.push('/login');
          }
        } else if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          // User needs confirmation (shouldn't happen if email verification is disabled)
          console.log('AuthForm: User needs confirmation');
          Alert.alert('Info', 'User created but needs confirmation. Please check your email or contact admin.');
          router.push('/login');
        } else {
          console.log('AuthForm: Unexpected signup flow:', result.nextStep);
          Alert.alert('Success', 'User registered! Please try logging in.');
          router.push('/login');
        }
      } else if (mode === 'login') {
        console.log('AuthForm: Attempting to sign in with username:', username);
        const result = await signIn({ username, password });
        console.log('AuthForm: Sign in result:', result);
        await refreshUser(); // Refresh the auth context
        Alert.alert('Success', 'Logged in successfully!');
        router.push('/'); // redirect to home page
      }
    } catch (err: any) {
      console.error('AuthForm: Authentication error:', err);
      console.error('AuthForm: Error details:', {
        name: err.name,
        message: err.message,
        code: err.code
      });
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'signup' ? 'Sign Up' : 'Login'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={loading ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Login'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
});
