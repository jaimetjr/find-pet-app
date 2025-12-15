import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdoptionRequests } from '@/hooks/useAdoptionRequests';
import AdoptionRequestCard from '@/components/AdoptionRequestCard';
import { AdoptionRequestStatus } from '@/enums/adoptionRequestStatus-enum';
import { AdoptionRequestDTO } from '@/dtos/adoptionRequestDto';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';

type TabType = 'my-requests' | 'received';
type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdoptionRequestsScreen() {
  const theme = useTheme();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const {
    myRequests,
    receivedRequests,
    loading,
    error,
    fetchMyRequests,
    fetchReceivedRequests,
    getSummary,
  } = useAdoptionRequests();

  // Initialize tab from params or default to 'my-requests'
  const [activeTab, setActiveTab] = useState<TabType>(
    (tab === 'received' ? 'received' : 'my-requests') as TabType
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Update tab when params change (e.g., when navigating with tab param)
  useEffect(() => {
    if (tab === 'received') {
      setActiveTab('received');
    } else if (tab === 'my-requests') {
      setActiveTab('my-requests');
    }
  }, [tab]);

  // Load data on mount
  useEffect(() => {
    fetchMyRequests();
    fetchReceivedRequests();
  }, []);

  // Refresh data when screen comes into focus (e.g., when navigating back from notifications)
  useFocusEffect(
    useCallback(() => {
      fetchMyRequests();
      fetchReceivedRequests();
    }, [fetchMyRequests, fetchReceivedRequests])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'my-requests') {
      await fetchMyRequests();
    } else {
      await fetchReceivedRequests();
    }
    setRefreshing(false);
  };

  const filterRequests = (requests: AdoptionRequestDTO[]) => {
    switch (activeFilter) {
      case 'pending':
        return requests.filter(r => 
          r.status === AdoptionRequestStatus.Submitted ||
          r.status === AdoptionRequestStatus.UnderReview ||
          r.status === AdoptionRequestStatus.Interview
        );
      case 'approved':
        return requests.filter(r => r.status === AdoptionRequestStatus.Approved);
      case 'rejected':
        return requests.filter(r => 
          r.status === AdoptionRequestStatus.Rejected ||
          r.status === AdoptionRequestStatus.Cancelled
        );
      default:
        return requests;
    }
  };

  const currentRequests = activeTab === 'my-requests' ? myRequests : receivedRequests;
  const filteredRequests = filterRequests(currentRequests);
  const summary = getSummary(currentRequests);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={activeTab === 'my-requests' ? 'document-text-outline' : 'mail-open-outline'} 
        size={64} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {activeTab === 'my-requests' 
          ? 'Nenhuma solicitação enviada'
          : 'Nenhuma solicitação recebida'}
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
        {activeTab === 'my-requests'
          ? 'Encontre um pet e envie uma solicitação de adoção'
          : 'As solicitações para seus pets aparecerão aqui'}
      </Text>
    </View>
  );

  const renderTabButton = (tab: TabType, label: string, count: number) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          isActive && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <Text
          style={[
            styles.tabText,
            { color: isActive ? theme.colors.primary : theme.colors.textSecondary }
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.badgeText, { color: theme.colors.text }]}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: FilterType, label: string) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          { borderColor: theme.colors.border },
          isActive && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
        ]}
        onPress={() => setActiveFilter(filter)}
      >
        <Text
          style={[
            styles.filterText,
            { color: isActive ? theme.colors.text : theme.colors.textSecondary }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Solicitações de Adoção</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
        {renderTabButton('my-requests', 'Enviadas', myRequests.length)}
        {renderTabButton('received', 'Recebidas', summary.pending)}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Todas')}
        {renderFilterButton('pending', 'Pendentes')}
        {renderFilterButton('approved', 'Aprovadas')}
        {renderFilterButton('rejected', 'Rejeitadas')}
      </View>

      {/* Error State */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#ff475215' }]}>
          <Ionicons name="alert-circle" size={20} color="#ff4752" />
          <Text style={[styles.errorText, { color: '#ff4752' }]}>{error}</Text>
        </View>
      )}

      {/* Summary */}
      {currentRequests.length > 0 && (
        <View style={[styles.summaryContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.colors.text }]}>{summary.total}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#FF9800' }]}>{summary.pending}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Pendentes</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>{summary.approved}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Aprovadas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F44336' }]}>{summary.rejected}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Rejeitadas</Text>
          </View>
        </View>
      )}

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={({ item }) => (
          <AdoptionRequestCard
            request={item}
            viewMode={activeTab === 'my-requests' ? 'adopter' : 'owner'}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredRequests.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />

      {/* Loading Overlay */}
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

