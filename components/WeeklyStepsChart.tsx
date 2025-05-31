/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import moment from 'moment';
import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import {BarChart, LineChart, PieChart} from 'react-native-gifted-charts';
import {ISteps} from '../lib/interfaces';
import {getWeeklyDateRange} from '../lib/utils';

interface FitnessDashboardProps {
  fitnessData: ISteps[];
  isDarkMode?: boolean;
}

const FitnessDashboard: React.FC<FitnessDashboardProps> = ({
  fitnessData,
  isDarkMode = true,
}) => {
  const weeklyDateRange = useMemo(() => {
    return getWeeklyDateRange();
  }, []);
  const [currentMetric, setCurrentMetric] = useState<
    'steps' | 'calories' | 'distance' | 'time'
  >('steps');
  const screenWidth = Dimensions.get('window').width - 40;

  const colors = {
    background: isDarkMode ? '#0a1a3a' : '#FFFFFF',
    cardBackground: isDarkMode ? '#1a2a4a' : '#f8f9fa',
    text: isDarkMode ? '#ffffff' : '#0a1a3a',
    primary: isDarkMode ? '#4e9af5' : '#2673e6',
    secondary: isDarkMode ? '#f39c12' : '#e67e22',
    success: isDarkMode ? '#2ecc71' : '#27ae60',
    danger: isDarkMode ? '#e74c3c' : '#c0392b',
    accent: isDarkMode ? '#9b59b6' : '#8e44ad',
  };
  // Get latest data for summary cards
  // const latestData = fitnessData[fitnessData?.length - 1] || {
  //   steps: 0,
  //   caloriesBurned: 0,
  //   kilometers: 0,
  //   spendMinutes: 0,
  //   date: new Date().toISOString().split('T')[0],
  // };
  const filterTodayData = useCallback((data: ISteps[]): ISteps => {
    const today = moment().format('YYYY-MM-DD'); // Get today's date in "YYYY-MM-DD" format

    return (
      data?.find(d => moment(d.date).format('YYYY-MM-DD') === today) || {
        caloriesBurned: 0,
        date: new Date(today), // Ensure `date` is a `Date` object
        kilometers: 0,
        spendMinutes: 0,
        steps: 0,
        user: '', // Default to an empty string; ensure this aligns with your data model
        isGoalReached: false,
        walkSessions: 0, // Set to a number instead of an array
        avgStepsPerHour: 0, // Default numeric value
      }
    );
  }, []);

  const latestData = useMemo(() => {
    return filterTodayData(fitnessData);
  }, [filterTodayData, fitnessData]);
  console.log('LATEST DATA', fitnessData[fitnessData?.length - 1]);

  // Prepare line chart data for trends
  const prepareLineChartData = (metric: keyof ISteps) => {
    return fitnessData?.map(item => ({
      value: typeof item[metric] === 'number' ? item[metric] : 0,
      label: new Date(item.date).getDate().toString(),
      dataPointText:
        typeof item[metric] === 'number' ? item[metric].toString() : '0',
    }));
  };

  // Prepare pie chart data for today's activity breakdown
  const pieData = [
    {
      value: latestData?.steps || 0,
      color: colors.primary,
      text: String(latestData?.steps || 0),
      label: 'Steps',
    },
    {
      value: Math.round(latestData?.caloriesBurned || 0),
      color: colors.secondary,
      text: String(Math.round(latestData?.caloriesBurned || 0)),
      label: 'Calories',
    },
    {
      value: Math.round((latestData?.kilometers || 0) * 1000), // Convert to meters for better visualization
      color: colors.success,
      text: `${((latestData?.kilometers || 0) * 1000).toFixed(0)}m`,
      label: 'Distance',
    },
    {
      value: Math.round(latestData?.spendMinutes || 0),
      color: colors.accent,
      text: (latestData?.spendMinutes / 60).toFixed(1) || 0,
      label: 'Minutes',
    },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: 'Steps',
      value: latestData?.steps?.toLocaleString() || 0,
      color: colors.primary,
      trend:
        fitnessData?.length > 1
          ? (
              ((latestData?.steps ||
                0 - fitnessData[fitnessData?.length - 2]?.steps) /
                fitnessData[fitnessData?.length - 2]?.steps) *
              100
            ).toFixed(1)
          : '0',
    },
    {
      title: 'Calories',
      value: latestData?.caloriesBurned?.toFixed(1) || 0,
      color: colors.secondary,
      trend:
        fitnessData?.length > 1
          ? (
              ((latestData?.caloriesBurned ||
                0 - fitnessData[fitnessData?.length - 2].caloriesBurned) /
                fitnessData[fitnessData?.length - 2].caloriesBurned) *
              100
            ).toFixed(1)
          : '0',
    },
    {
      title: 'Distance (km)',
      value: latestData.kilometers.toFixed(3),
      color: colors.success,
      trend:
        fitnessData.length > 1
          ? (
              ((latestData.kilometers -
                fitnessData[fitnessData?.length - 2]?.kilometers) /
                fitnessData[fitnessData?.length - 2]?.kilometers) *
              100
            ).toFixed(1)
          : '0',
    },
    {
      title: 'Time (min)',
      value: (latestData.spendMinutes / 60).toFixed(1) || 0,
      color: colors.accent,
      trend:
        fitnessData?.length > 1
          ? (
              ((latestData.spendMinutes -
                fitnessData[fitnessData?.length - 2]?.spendMinutes) /
                fitnessData[fitnessData?.length - 2]?.spendMinutes) *
              100
            )?.toFixed(1)
          : '0',
    },
  ];

  const renderSummaryCard = useCallback(
    (card: any, index: number) => {
      const trendValue = parseFloat(card.trend);
      const isTrendValid = !isNaN(trendValue);

      return (
        <View
          key={index}
          style={[
            styles.summaryCard,
            {backgroundColor: colors.cardBackground},
          ]}>
          <Text style={[styles.cardTitle, {color: colors.text}]}>
            {card.title}
          </Text>
          <Text style={[styles.cardValue, {color: card.color}]}>
            {card.value || 'N/A'}
            {/* Fallback to 'N/A' if card.value is undefined or null */}
          </Text>
          <Text
            style={[
              styles.cardTrend,
              {
                color:
                  isTrendValid && trendValue >= 0
                    ? colors.success
                    : colors.danger,
              },
            ]}>
            {isTrendValid
              ? `${trendValue >= 0 ? '↗' : '↘'} ${Math.abs(trendValue)}%`
              : 'N/A'}
            {/* Fallback to 'N/A' if trendValue is not valid */}
          </Text>
        </View>
      );
    },
    [colors.cardBackground, colors.danger, colors.success, colors.text],
  );

  const getCurrentChartData = () => {
    switch (currentMetric) {
      case 'steps':
        return prepareLineChartData('steps');
      case 'calories':
        return prepareLineChartData('caloriesBurned');
      case 'distance':
        return prepareLineChartData('kilometers');
      case 'time':
        return prepareLineChartData('spendMinutes');
      default:
        return prepareLineChartData('steps');
    }
  };

  const getMetricColor = () => {
    switch (currentMetric) {
      case 'steps':
        return colors.primary;
      case 'calories':
        return colors.secondary;
      case 'distance':
        return colors.success;
      case 'time':
        return colors.accent;
      default:
        return colors.primary;
    }
  };
  const useFormatToLocaleDateString = () => {
    const formatToLocaleDateString = useCallback(
      (date: Date | string | number, isReturnYear = false): string => {
        const formatString = isReturnYear
          ? 'dddd, MMMM D, YYYY'
          : 'dddd, MMMM D';
        return moment(date).format(formatString);
      },
      [],
    );

    return formatToLocaleDateString;
  };

  const formatToLocaleDateString = useFormatToLocaleDateString();

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.dateText, {color: colors.text}]}>
          {formatToLocaleDateString(weeklyDateRange.startOfWeek, false)} -
        </Text>
        <Text style={[styles.dateText, {color: colors.text}]}>
          {formatToLocaleDateString(weeklyDateRange.endOfWeek, true)}-
        </Text>
        <Text style={[styles.subtitle, {color: colors.text, opacity: 0.7}]}>
          Fitness Dashboard
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {summaryCards.map(renderSummaryCard)}
      </View>

      {/* Activity Breakdown Pie Chart */}
      <View
        style={[
          styles.chartContainer,
          {backgroundColor: colors.cardBackground},
        ]}>
        <Text style={[styles.chartTitle, {color: colors.text}]}>
          Today's Activity Breakdown
        </Text>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={pieData}
            radius={80}
            innerRadius={40}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={[styles.centerLabelText, {color: colors.text}]}>
                  Total
                </Text>
                <Text
                  style={[styles.centerLabelValue, {color: colors.primary}]}>
                  {latestData.steps}
                </Text>
              </View>
            )}
          />
          <View style={styles.legendContainer}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendColor, {backgroundColor: item.color}]}
                />
                <Text style={[styles.legendText, {color: colors.text}]}>
                  {item.label}: {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Trend Line Chart */}
      <View
        style={[
          styles.chartContainer,
          {backgroundColor: colors.cardBackground},
        ]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, {color: colors.text}]}>
            Trend Analysis
          </Text>
          <View style={styles.metricButtons}>
            {(['steps', 'calories', 'distance', 'time'] as const).map(
              metric => (
                <Text
                  key={metric}
                  style={[
                    styles.metricButton,
                    {
                      color:
                        currentMetric === metric
                          ? getMetricColor()
                          : colors.text,
                      opacity: currentMetric === metric ? 1 : 0.6,
                    },
                  ]}
                  onPress={() => setCurrentMetric(metric)}>
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Text>
              ),
            )}
          </View>
        </View>

        {fitnessData?.length > 1 ? (
          <LineChart
            data={getCurrentChartData()}
            width={screenWidth - 32}
            height={250}
            color={getMetricColor()}
            thickness={3}
            dataPointsColor={getMetricColor()}
            dataPointsRadius={6}
            textColor={colors.text}
            textFontSize={12}
            yAxisTextStyle={{color: colors.text}}
            xAxisLabelTextStyle={{color: colors.text}}
            backgroundColor={colors.cardBackground}
            curved
            hideRules={false}
            rulesColor={isDarkMode ? '#333' : '#eee'}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, {color: colors.text}]}>
              Add more data points to see trends
            </Text>
          </View>
        )}
      </View>

      {/* Weekly Bar Chart */}
      {fitnessData?.length > 0 && (
        <View
          style={[
            styles.chartContainer,
            {backgroundColor: colors.cardBackground},
          ]}>
          <Text style={[styles.chartTitle, {color: colors.text}]}>
            Weekly Steps Overview
          </Text>
          <BarChart
            data={fitnessData?.slice(-7)?.map(item => ({
              value: item.steps,
              label: new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
              }),
              frontColor: colors.primary,
            }))}
            width={screenWidth - 32}
            height={220}
            barWidth={8}
            spacing={20}
            barBorderRadius={10}
            backgroundColor={colors.cardBackground}
            yAxisTextStyle={{color: colors.text}}
            xAxisLabelTextStyle={{color: colors.text}}
            hideRules={false}
            rulesColor={isDarkMode ? '#333' : '#eee'}
            showGradient
            gradientColor={colors.primary}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  metricButton: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 12,
  },
  centerLabelValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  noDataContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    opacity: 0.6,
  },
});

export default FitnessDashboard;
