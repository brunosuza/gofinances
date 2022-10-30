import 'react-native-gesture-handler';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import { Routes } from './src/routes';
import { ThemeProvider } from 'styled-components';

import theme from './src/global/styles/theme';

import { NavigationContainer } from '@react-navigation/native';
import { AppRoutes } from './src/routes/app.routes';

import * as SplashScreen from 'expo-splash-screen';
import { Dashboard } from './src/screens/Dashboard';
import { CategorySelect } from './src/screens/CategorySelect';
import { StatusBar } from 'expo-status-bar';

import { SignIn } from './src/screens/SignIn';

import { AuthProvider, useAuth } from './src/hooks/auth';


export default function App() {
  SplashScreen.preventAutoHideAsync();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const { userStorageLoading } = useAuth();

  if (!fontsLoaded || userStorageLoading) {
    return null;
  }

  SplashScreen.hideAsync();

  return (
    <>
      <ThemeProvider theme={theme}>
       
          <StatusBar barStyle='light-content' />
            <AuthProvider>
              <Routes />
            </AuthProvider>
       
      </ThemeProvider>
    </>
  );
}