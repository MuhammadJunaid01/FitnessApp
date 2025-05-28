/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface Calorie {
  calorie: number;
  day: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  wasManuallyEntered: boolean;
  // Add optional time fields for when the activity occurred
  activityTime?: string; // ISO date string with time
  lastUpdated?: string; // ISO date string with time
}

interface WeeklyCaloriesProps {
  data: Calorie[];
  isDarkMode: boolean;
}

const WeeklyCalories: React.FC<WeeklyCaloriesProps> = ({data, isDarkMode}) => {
  const screenWidth = Dimensions.get('window').width;

  const theme = {
    backgroundColor: isDarkMode ? '#0a1a3a' : '#ffffff',
    cardColor: isDarkMode ? '#1e3a8a' : '#f8fafc',
    textColor: isDarkMode ? '#ffffff' : '#1e293b',
    subtitleColor: isDarkMode ? '#9ca3af' : '#64748b',
    borderColor: isDarkMode ? '#374151' : '#e2e8f0',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
  };

  // Helper function to format time from ISO string
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper function to get time display for each day
  const getTimeDisplay = (item: Calorie): string => {
    if (item.activityTime) {
      return formatTime(item.activityTime);
    } else if (item.lastUpdated) {
      return `Updated ${formatTime(item.lastUpdated)}`;
    } else {
      // Use current time as fallback
      return formatTime(new Date().toISOString());
    }
  };

  // Process data for chart
  const processedData = data.map((item, index) => {
    const dayAbbr = item.day.substring(0, 3); // Get first 3 letters of day
    const timeDisplay = getTimeDisplay(item);

    return {
      value: item.calorie,
      label: dayAbbr,
      frontColor: item.wasManuallyEntered
        ? isDarkMode
          ? '#f59e0b'
          : '#f59e0b' // Orange for manual entries
        : isDarkMode
        ? '#3b82f6'
        : '#3b82f6', // Blue for automatic entries
      gradientColor: item.wasManuallyEntered
        ? isDarkMode
          ? '#fbbf24'
          : '#fcd34d'
        : isDarkMode
        ? '#60a5fa'
        : '#93c5fd',
      spacing: index === 0 ? 0 : 10,
      labelTextStyle: {
        color: theme.textColor,
        fontSize: 12,
        fontWeight: '500',
      },
      // Store time info for tooltips or additional display
      timeDisplay,
      originalData: item,
    };
  });

  // Calculate statistics
  const totalCalories = data.reduce((sum, item) => sum + item.calorie, 0);
  const averageCalories = data.length > 0 ? Math.round(totalCalories / 7) : 0;
  const maxCalories =
    data.length > 0 ? Math.max(...data.map(item => item.calorie)) : 0;
  const manualEntries = data.filter(item => item.wasManuallyEntered).length;

  // Find the most recent activity time
  const getMostRecentActivityTime = (): string => {
    const activitiesWithTime = data.filter(
      item => item.activityTime || item.lastUpdated,
    );
    if (activitiesWithTime.length === 0) return '';

    const mostRecent = activitiesWithTime.reduce((latest, current) => {
      const latestTime = new Date(
        latest.activityTime || latest.lastUpdated || '',
      );
      const currentTime = new Date(
        current.activityTime || current.lastUpdated || '',
      );
      return currentTime > latestTime ? current : latest;
    });

    return formatTime(mostRecent.activityTime || mostRecent.lastUpdated || '');
  };

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    timeInfo,
  }: {
    icon: string;
    title: string;
    value: string | number;
    subtitle?: string;
    timeInfo?: string;
  }) => (
    <View
      style={[
        styles.statCard,
        {backgroundColor: theme.cardColor, borderColor: theme.borderColor},
      ]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={theme.textColor} />
        <Text style={[styles.statTitle, {color: theme.subtitleColor}]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.statValue, {color: theme.textColor}]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, {color: theme.subtitleColor}]}>
          {subtitle}
        </Text>
      )}
      {timeInfo && (
        <Text style={[styles.timeInfo, {color: theme.subtitleColor}]}>
          {timeInfo}
        </Text>
      )}
    </View>
  );

  // Custom BarChart component with time labels
  const CustomBarChart = () => (
    <View>
      <BarChart
        data={processedData}
        width={screenWidth - 80}
        barWidth={35}
        spacing={15}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={1}
        yAxisThickness={1}
        xAxisColor={theme.gridColor}
        yAxisColor={theme.gridColor}
        yAxisTextStyle={{
          color: theme.subtitleColor,
          fontSize: 11,
        }}
        noOfSections={4}
        maxValue={Math.max(...data.map(item => item.calorie)) * 1.1}
        isAnimated
        animationDuration={1000}
        gradientColor={isDarkMode ? '#1e3a8a' : '#f8fafc'}
        frontColor={isDarkMode ? '#3b82f6' : '#3b82f6'}
      />

      {/* Time labels below each bar */}
      <View style={styles.timeLabelsContainer}>
        {processedData.map((item, index) => (
          <View key={index} style={[styles.timeLabelItem, {width: 35 + 15}]}>
            <Text style={[styles.timeLabel, {color: theme.subtitleColor}]}>
              {item.timeDisplay}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="local-fire-department" size={28} color="#f59e0b" />
          <Text style={[styles.title, {color: theme.textColor}]}>
            Weekly Calories Burned
          </Text>
        </View>
        <Text style={[styles.subtitle, {color: theme.subtitleColor}]}>
          Track your daily calorie burn progress
        </Text>
        {getMostRecentActivityTime() && (
          <Text style={[styles.lastActivityTime, {color: theme.subtitleColor}]}>
            Last activity: {getMostRecentActivityTime()}
          </Text>
        )}
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="whatshot"
          title="Total Burned"
          value={`${totalCalories.toLocaleString()}`}
          subtitle="calories this week"
        />
        <StatCard
          icon="trending-up"
          title="Daily Average"
          value={`${averageCalories.toLocaleString()}`}
          subtitle="calories per day"
          timeInfo={
            getMostRecentActivityTime()
              ? `Active at ${getMostRecentActivityTime()}`
              : undefined
          }
        />
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          icon="star"
          title="Best Day"
          value={`${maxCalories.toLocaleString()}`}
          subtitle="highest burn"
        />
        <StatCard
          icon="edit"
          title="Manual Entries"
          value={manualEntries}
          subtitle={`out of ${7} days`}
        />
      </View>

      {/* Chart Container */}
      <View>
        {/* <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, {color: theme.textColor}]}>
            Daily Breakdown
          </Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#3b82f6'}]} />
              <Text style={[styles.legendText, {color: theme.subtitleColor}]}>
                Auto
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#f59e0b'}]} />
              <Text style={[styles.legendText, {color: theme.subtitleColor}]}>
                Manual
              </Text>
            </View>
          </View>
        </View> */}

        {data.length > 0 ? null : (
          <View
            style={[
              styles.chartContainer,
              {
                backgroundColor: theme.cardColor,
                borderColor: theme.borderColor,
              },
            ]}>
            <View style={styles.noDataContainer}>
              <Icon name="bar-chart" size={48} color={theme.subtitleColor} />
              <Text style={[styles.noDataText, {color: theme.subtitleColor}]}>
                No calorie data available
              </Text>
              <Text
                style={[styles.noDataSubtext, {color: theme.subtitleColor}]}>
                Start tracking your daily activities to see your progress
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Detailed Time Information */}
      {data.length > 0 && (
        <View
          style={[
            styles.timeDetailsContainer,
            {backgroundColor: theme.cardColor, borderColor: theme.borderColor},
          ]}>
          <Text style={[styles.timeDetailsTitle, {color: theme.textColor}]}>
            Activity Times
          </Text>
          {data.map((item, index) => (
            <View key={index} style={styles.timeDetailRow}>
              <Text style={[styles.dayName, {color: theme.textColor}]}>
                {item.day}
              </Text>
              <View style={styles.timeDetailInfo}>
                <Text style={[styles.calorieAmount, {color: theme.textColor}]}>
                  {item?.calorie?.toFixed(3)} cal
                </Text>
                <Text
                  style={[styles.activityTime, {color: theme.subtitleColor}]}>
                  {getTimeDisplay(item)}
                </Text>
              </View>
              <View
                style={[
                  styles.entryTypeIndicator,
                  {
                    backgroundColor: item.wasManuallyEntered
                      ? '#f59e0b'
                      : '#3b82f6',
                  },
                ]}
              />
            </View>
          ))}
        </View>
      )}

      {/* Additional Info */}
      {data.length > 0 && (
        <View
          style={[
            styles.infoContainer,
            {backgroundColor: theme.cardColor, borderColor: theme.borderColor},
          ]}>
          <Icon
            name="info"
            size={16}
            color={theme.subtitleColor}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, {color: theme.subtitleColor}]}>
            Orange bars represent manually entered data, while blue bars show
            automatically tracked calories. Times shown are when activities were
            recorded or last updated.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  lastActivityTime: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeInfo: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
    fontStyle: 'italic',
  },
  chartContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeLabelsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingHorizontal: 0,
  },
  timeLabelItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '400',
    textAlign: 'center',
  },
  timeDetailsContainer: {
    margin: 20,
    marginTop: 7,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  timeDetailInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  calorieAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '400',
  },
  entryTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});

export default WeeklyCalories;
