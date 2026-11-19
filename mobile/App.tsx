import { StatusBar, StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.brandMark}>
        <Text style={styles.brandInitial}>S</Text>
      </View>
      <Text style={styles.brand}>SickFit</Text>
      <Text style={styles.eyebrow}>ALLENATI CON INTENZIONE</Text>
      <Text style={styles.title}>Costanza in movimento.</Text>
      <Text style={styles.description}>
        La tua app nativa è pronta per la prossima fase di sviluppo.
      </Text>
      <StatusBar barStyle="light-content" />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0b100e',
  },
  brandMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#d7ff75',
  },
  brandInitial: {
    color: '#0b100e',
    fontSize: 25,
    fontWeight: '800',
  },
  brand: {
    marginTop: 12,
    color: '#f5f5f2',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  eyebrow: {
    marginTop: 48,
    color: '#d7ff75',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    maxWidth: 320,
    marginTop: 14,
    color: '#f5f5f2',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.4,
    textAlign: 'center',
  },
  description: {
    maxWidth: 280,
    marginTop: 14,
    color: '#a8b0aa',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
})
