import { StyleSheet } from 'react-native';

export const style = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#e2e8f0',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    marginTop: 8,
    color: '#475569',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  switchButtonActive: {
    backgroundColor: '#2563eb',
  },
  switchText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    color: '#0f172a',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});


