import { View, StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";

export default function Logo({ size = 80 }: { size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 32 32" fill="none">
        <G>
          {/* Main stem */}
          <Path
            d="M16 28 L16 12"
            stroke="#9BC49B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Left leaf - larger, curved */}
          <Path
            d="M16 16 Q10 14 8 18 Q7 20 8 22 Q9 23 11 22 Q14 20 16 16 Z"
            fill="#B8D4A8"
          />
          
          {/* Right leaf - larger, curved */}
          <Path
            d="M16 16 Q22 14 24 18 Q25 20 24 22 Q23 23 21 22 Q18 20 16 16 Z"
            fill="#B8D4A8"
          />
          
          {/* Left leaf vein */}
          <Path
            d="M16 16 Q12 17 10 20"
            stroke="#7A9B76"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
          
          {/* Right leaf vein */}
          <Path
            d="M16 16 Q20 17 22 20"
            stroke="#7A9B76"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#7A9B76",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7A9B76",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});