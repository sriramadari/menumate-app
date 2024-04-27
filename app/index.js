import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import App from "./App"

export default function Index() {
  return (
   <PaperProvider>
     <App/>
   </PaperProvider>
  );
}

