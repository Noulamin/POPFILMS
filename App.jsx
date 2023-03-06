import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/components/Home'
import Settings from './Settings'

const {Navigator, Screen } = createNativeStackNavigator();


const App = () => {
  return(
    <NavigationContainer>
      <Navigator>
        <Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Screen name="Settings" component={Settings}  />
      </Navigator>
    </NavigationContainer>
  )
}

export default App