
import { Tabs} from "expo-router";
import Octicons from '@expo/vector-icons/Octicons';

export default function TabsLayout() {
  return (
  <Tabs screenOptions={{ headerStyle: { backgroundColor: '#E6F4FE' },
   headerTitleStyle: { color: '#2A2A2A', fontWeight: '600' },
   tabBarActiveTintColor: '#7A9B76',
   tabBarInactiveTintColor: '#6A6A6A',
   tabBarStyle: { backgroundColor: '#F5F3EE', borderTopWidth: 0 },
  }}  >
  <Tabs.Screen 
    name="index"
      options={{ title: "Today's Goals"  , 
      tabBarIcon: ({ color , size }) =>{
        return <Octicons name="goal" size={size} color={color} />
      },
        }} />
  <Tabs.Screen 
    name="streaks" 
    options={{ 
      title: "Streaks",
      tabBarIcon: ({ color, size }) => {
        return <Octicons name="person" size={size} color={color} />
      }
    }} />
  </Tabs>);
}
