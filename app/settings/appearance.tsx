import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';

export default function AppearanceScreen() {
  const { themeMode, colorScheme, colors, setThemeMode, setColorScheme } = useTheme();

  const themeModes: Array<{ value: 'light' | 'dark' | 'auto'; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  const colorSchemes: Array<{ value: 'green' | 'blue' | 'purple' | 'orange'; label: string; color: string }> = [
    { value: 'green', label: 'Green', color: '#7A9B76' },
    { value: 'blue', label: 'Blue', color: '#5B8DBE' },
    { value: 'purple', label: 'Purple', color: '#9B7AB5' },
    { value: 'orange', label: 'Orange', color: '#E89B6C' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* THEME MODE SECTION DISABLED - Dark theme not supported */}
      {/* <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Mode</Text>
        
        {themeModes.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.option,
              { 
                backgroundColor: colors.card,
                borderColor: themeMode === mode.value ? colors.primary : colors.border,
                borderWidth: themeMode === mode.value ? 2 : 1,
              }
            ]}
            onPress={() => setThemeMode(mode.value)}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {mode.label}
            </Text>
            {themeMode === mode.value && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View> */}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Color Scheme</Text>
        
        {colorSchemes.map((scheme) => (
          <TouchableOpacity
            key={scheme.value}
            style={[
              styles.option,
              { 
                backgroundColor: colors.card,
                borderColor: colorScheme === scheme.value ? colors.primary : colors.border,
                borderWidth: colorScheme === scheme.value ? 2 : 1,
              }
            ]}
            onPress={() => setColorScheme(scheme.value)}
          >
            <View style={styles.colorOption}>
              <View style={[styles.colorPreview, { backgroundColor: scheme.color }]} />
              <Text style={[styles.optionText, { color: colors.text }]}>
                {scheme.label}
              </Text>
            </View>
            {colorScheme === scheme.value && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});