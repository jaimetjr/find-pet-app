import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<Props & { theme: any }, State> {
  constructor(props: Props & { theme: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={[styles.container, { backgroundColor: this.props.theme.colors.background }]}>
          <View style={[styles.errorContainer, { backgroundColor: this.props.theme.colors.card }]}>
            <Text style={[styles.title, { color: this.props.theme.colors.text }]}>
              Oops! Algo deu errado
            </Text>
            <Text style={[styles.message, { color: this.props.theme.colors.text }]}>
              Encontramos um problema inesperado. Tente novamente.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={[styles.errorDetails, { color: this.props.theme.colors.text }]}>
                {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: this.props.theme.colors.primary }]}
              onPress={this.handleRetry}
            >
              <Text style={[styles.retryButtonText, { color: this.props.theme.colors.text }]}>
                Tentar Novamente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide theme context
export default function ErrorBoundary({ children, fallback }: Props) {
  const theme = useTheme();
  
  return (
    <ErrorBoundaryClass theme={theme} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    borderRadius: 4,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 