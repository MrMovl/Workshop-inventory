import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type as t } from '../theme';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{this.state.error?.message ?? 'An unexpected error occurred.'}</Text>
        <Pressable
          style={styles.button}
          onPress={() => this.setState({ hasError: false, error: null })}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[4],
  },
  title: {
    ...t.title,
    color: colors.danger,
    marginBottom: space[2],
    textAlign: 'center',
  },
  message: {
    ...t.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: space[6],
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: space[6],
  },
  buttonText: {
    color: colors.accentInk,
    fontSize: 15,
    fontWeight: '600',
  },
});
