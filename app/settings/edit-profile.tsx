import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const { user, updateUserName } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateUserName(name);
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          mode="outlined"
          autoCapitalize="words"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          textColor={colors.text}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>Profile updated!</Text> : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
  error: {
    color: '#D32F2F',
    marginBottom: 12,
  },
  success: {
    color: '#4CAF50',
    marginBottom: 12,
  },
});