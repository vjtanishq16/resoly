import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, RadioButton, Text, useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';

export default function AppearanceSettings() {
  const { themeMode, colorScheme, setThemeMode, setColorScheme } = useTheme();
  const paperTheme = usePaperTheme();

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Theme Mode</List.Subheader>
        
        <RadioButton.Group onValueChange={value => setThemeMode(value as any)} value={themeMode}>
          <List.Item
            title="Light"
            left={() => <RadioButton value="light" />}
          />
          <List.Item
            title="Dark"
            left={() => <RadioButton value="dark" />}
          />
          <List.Item
            title="Auto (System)"
            left={() => <RadioButton value="auto" />}
          />
        </RadioButton.Group>
      </List.Section>

      <List.Section>
        <List.Subheader>Color Scheme</List.Subheader>
        
        <RadioButton.Group onValueChange={value => setColorScheme(value as any)} value={colorScheme}>
          <List.Item
            title="Green"
            left={() => <RadioButton value="green" />}
            right={() => <View style={[styles.colorPreview, { backgroundColor: '#4CAF50' }]} />}
          />
          <List.Item
            title="Blue"
            left={() => <RadioButton value="blue" />}
            right={() => <View style={[styles.colorPreview, { backgroundColor: '#2196F3' }]} />}
          />
          <List.Item
            title="Purple"
            left={() => <RadioButton value="purple" />}
            right={() => <View style={[styles.colorPreview, { backgroundColor: '#9C27B0' }]} />}
          />
          <List.Item
            title="Orange"
            left={() => <RadioButton value="orange" />}
            right={() => <View style={[styles.colorPreview, { backgroundColor: '#FF9800' }]} />}
          />
        </RadioButton.Group>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
});