
import { Tabs} from "expo-router";
import Octicons from '@expo/vector-icons/Octicons';

export default function TabsLayout() {
  return (
  <Tabs screenOptions={{ tabBarActiveTintColor: 'green' }}>
  <Tabs.Screen 
    name="index"
      options={{ title: "Home"  , 
      tabBarIcon: ({ color , focused}) =>{
        return focused ? <Octicons name="home-fill" size={24} color={color} /> :    
       <Octicons name="home" size={24} color={color} />
      },
        }} />
  <Tabs.Screen 
    name="login" 
    options={{ 
      title: "Login",
      tabBarIcon: ({ color, focused }) => {
        return focused ? <Octicons name="person-fill" size={24} color={color} /> :
          <Octicons name="person" size={24} color={color} />
      }
    }} />
  </Tabs>);
}
