
import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, BackHandler, View, ActivityIndicator, TouchableOpacity, Text, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onBack = () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#d9252a' }}>
      <WebView
        ref={webRef}
        source={{ uri:'https://ntelecom.sgp.tsmx.com.br/accounts/central/login?next=/central/home/' }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
        startInLoadingState
      />

      {loading && (
        <View style={{position:'absolute', top:0,left:0,right:0,bottom:0,justifyContent:'center',alignItems:'center', backgroundColor:'#fff'}}>
          <ActivityIndicator size='large' />
        </View>
      )}

      <TouchableOpacity
        onPress={() => Linking.openURL('https://wa.me/5500000000000')}
        style={{position:'absolute', bottom:20, right:20, backgroundColor:'#25D366', padding:14, borderRadius:30}}
      >
        <Text style={{color:'#fff', fontWeight:'bold'}}>Suporte</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
