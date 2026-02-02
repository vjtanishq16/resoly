import { View, Text, StyleSheet } from "react-native";

type CategoryBadgeProps = {
  category: string;
  color: string;
};

export default function CategoryBadge({ category, color }: CategoryBadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.text, { color }]}>
        {category.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
