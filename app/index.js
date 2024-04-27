import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
   <PaperProvider>
   <View className="flex-1 items-center justify-center bg-slate-500">
      <Text className="text-fuchsia-800">Open up App.js to start working on your app!</Text>
      {/* <StatusBar style="auto" /> */}
    </View>
    </PaperProvider>
  );
}
5
