import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  generateCalendarGrid, 
  getWeekdayNames, 
  CalendarEventData,
  CalendarDate 
} from '@/utils/calendarUtils';
import DateCell from '@/components/calendar/DateCell';

const { width } = Dimensions.get('window');

interface CalendarGridProps {
  currentMonth: number;
  currentYear: number;
  selectedDate?: Date;
  eventData?: CalendarEventData[];
  onDateSelect: (date: Date) => void;
  cellSize?: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  currentYear,
  selectedDate,
  eventData = [],
  onDateSelect,
  cellSize,
}) => {
  const { theme } = useTheme();
  
  // Calculate responsive cell size
  const containerPadding = 32; // 16px padding on each side
  const gridGaps = 6 * 2; // 6 gaps between 7 columns, 2px each
  const availableWidth = width - containerPadding - gridGaps;
  const calculatedCellSize = cellSize || Math.floor(availableWidth / 7);
  
  // Generate calendar grid data
  const calendarDates: CalendarDate[] = generateCalendarGrid(
    currentYear,
    currentMonth,
    selectedDate,
    eventData
  );
  
  // Get weekday names
  const weekdayNames = getWeekdayNames('short');
  
  const renderWeekdayHeader = () => (
    <View style={styles.weekdayHeader}>
      {weekdayNames.map((weekday, index) => (
        <View 
          key={index} 
          style={[
            styles.weekdayCell,
            { width: calculatedCellSize }
          ]}
        >
          <Text style={[
            styles.weekdayText,
            { 
              color: theme.colors.text.secondary,
              fontSize: calculatedCellSize * 0.28,
            }
          ]}>
            {weekday}
          </Text>
        </View>
      ))}
    </View>
  );
  
  const renderCalendarWeeks = () => {
    const weeks = [];
    
    // Split calendar dates into weeks (7 days each)
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const weekStart = weekIndex * 7;
      const weekEnd = weekStart + 7;
      const weekDates = calendarDates.slice(weekStart, weekEnd);
      
      // Skip empty weeks (shouldn't happen with our 42-cell grid, but safety check)
      if (weekDates.length === 0) continue;
      
      weeks.push(
        <View key={weekIndex} style={styles.calendarWeek}>
          {weekDates.map((calendarDate, dayIndex) => (
            <DateCell
              key={`${weekIndex}-${dayIndex}`}
              calendarDate={calendarDate}
              onPress={onDateSelect}
              size={calculatedCellSize}
            />
          ))}
        </View>
      );
    }
    
    return weeks;
  };
  
  return (
    <View style={styles.calendarGrid}>
      {renderWeekdayHeader()}
      <View style={styles.calendarBody}>
        {renderCalendarWeeks()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarGrid: {
    width: '100%',
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 1,
  },
  weekdayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  weekdayText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarBody: {
    gap: 2,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
  },
});

export default CalendarGrid;