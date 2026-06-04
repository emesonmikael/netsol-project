import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  BackHandler,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

const SITE_URL = 'https://ntelecom.sgp.tsmx.com.br/accounts/central/login?next=/central/home/';
const WHATSAPP_URL = 'https://wa.me/5584999181760';
const LOADING_TIMEOUT_MS = 8000;

export default function App() {
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Auto-dismiss loading after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;
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

  const dismissLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoading(true);
    if (webRef.current) {
      webRef.current.reload();
    }
    setTimeout(() => setLoading(false), LOADING_TIMEOUT_MS);
  }, []);

  const handleSupportPress = useCallback(() => {
    Linking.openURL(WHATSAPP_URL);
  }, []);

  // Allow ALL navigations (critical for login redirects)
  const handleShouldStartLoad = useCallback(() => {
    return true;
  }, []);

  // Web platform: open in new tab since iframe blocks cookies
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webFallbackContainer}>
          <Text style={styles.webTitle}>NetSol Cliente</Text>
          <Text style={styles.webSubtitle}>Central do Assinante</Text>
          <Text style={styles.webMessage}>
            Para melhor experiência, acesse diretamente pelo navegador ou baixe o app no seu celular.
          </Text>

          <TouchableOpacity
            testID="open-browser-button"
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open(SITE_URL, '_blank');
              }
            }}
            style={styles.openBrowserButton}
            activeOpacity={0.8}
          >
            <Text style={styles.openBrowserText}>Abrir Central do Assinante</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="support-button-web"
            onPress={handleSupportPress}
            style={styles.webSupportButton}
            activeOpacity={0.8}
          >
            <Text style={styles.webSupportText}>Falar com Suporte</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Native platform: use WebView with proper cookie/session handling
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: SITE_URL }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        allowsInlineMediaPlayback={true}
        allowsBackForwardNavigationGestures={true}
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        onLoadEnd={dismissLoading}
        onError={handleError}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        originWhitelist={['*']}
        style={styles.webview}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d9252a" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro ao carregar</Text>
          <Text style={styles.errorMessage}>
            Não foi possível carregar a página.{'\n'}Verifique sua conexão com a internet.
          </Text>
          <TouchableOpacity
            testID="retry-button"
            onPress={handleRetry}
            style={styles.retryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        testID="support-button"
        onPress={handleSupportPress}
        style={styles.supportButton}
        activeOpacity={0.8}
      >
        <Text style={styles.supportText}>Suporte</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9252a',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9252a',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#d9252a',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  supportButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#d9252a',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  supportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Web fallback styles
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  webTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d9252a',
    marginBottom: 8,
  },
  webSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  webMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  openBrowserButton: {
    backgroundColor: '#d9252a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  openBrowserText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  webSupportButton: {
    backgroundColor: '#d9252a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  webSupportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
