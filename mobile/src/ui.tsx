import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

export const color = { bg: '#0c1412', panel: '#17221f', border: '#34453e', text: '#f5f8f4', muted: '#b9c7bd', accent: '#d7ff75', danger: '#ffb5aa' }
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: color.bg }, content: { padding: 20, paddingBottom: 48, gap: 14 },
  heading: { fontSize: 29, fontWeight: '700', color: color.text }, sub: { fontSize: 15, lineHeight: 22, color: color.muted },
  label: { fontSize: 15, fontWeight: '600', color: color.text, marginBottom: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: color.border, borderRadius: 10, padding: 12, fontSize: 16, color: color.text, backgroundColor: color.panel },
  card: { backgroundColor: color.panel, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: color.border, gap: 10 },
  title: { color: color.text, fontSize: 20, fontWeight: '700' }, text: { color: color.text, fontSize: 16, lineHeight: 23 },
  small: { color: color.muted, fontSize: 14, lineHeight: 20 }, row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  error: { color: color.danger, fontSize: 15, lineHeight: 22 },
})

export function Page({ children, refresh, refreshing }: { children: React.ReactNode; refresh?: () => void; refreshing?: boolean }) {
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    {children}
    {refresh && <Button title="Aggiorna" onPress={refresh} disabled={refreshing} secondary />}
  </ScrollView>
}
export function Button({ title, onPress, disabled, secondary, danger }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} onPress={onPress} disabled={disabled}
    style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: danger ? color.danger : color.accent, backgroundColor: secondary || danger ? 'transparent' : color.accent, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>
    <Text style={{ fontSize: 16, fontWeight: '700', textAlign: 'center', color: danger ? color.danger : secondary ? color.accent : color.bg }}>{title}</Text>
  </Pressable>
}
export function Field({ label, value, onChangeText, ...props }: TextInputProps & { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} style={styles.input} value={value} onChangeText={onChangeText} placeholderTextColor={color.muted} selectionColor={color.accent} {...props} /></View>
}
export function Notice({ message }: { message: string | null }) { return message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null }
export function Busy() { return <ActivityIndicator accessibilityLabel="Caricamento" color={color.accent} size="large" /> }
export function message(error: unknown) { return error instanceof Error ? error.message : 'Operazione non riuscita. Riprova.' }
