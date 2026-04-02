package com.example.web.utils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class TimeUtils {
    // converts time ranges to UTC start and end minutes from midnight (0-1440), handling wrap-around
    // Returns an array [startUtcMinutes, endUtcMinutes]
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    public static int[] convertTimeRangeToUtcMinutes(String timeRange, String timezoneId) {
        String[] parts = timeRange.split("-");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time range format: " + timeRange);
        }

        LocalTime startLocal = LocalTime.parse(parts[0], TIME_FORMATTER);
        LocalTime endLocal = LocalTime.parse(parts[1], TIME_FORMATTER);

        // Normalize "UTC+1" / "UTC-5" to "UTC+01:00" which Java's ZoneId requires
        ZoneId zone = ZoneId.of(normalizeUtcOffset(timezoneId));
        // convert to UTC using a reference date (any date, we need to handle wrap-around)
        // Use a fixed non-leap date
        LocalDate refDate = LocalDate.of(2024, 1, 1);
        ZonedDateTime startZoned = ZonedDateTime.of(refDate, startLocal, zone);
        ZonedDateTime endZoned = ZonedDateTime.of(refDate, endLocal, zone);

        // if end time is before start, it means the range crosses midnight
        if (endZoned.isBefore(startZoned)) {
            // Add one day to endZoned
            endZoned = endZoned.plusDays(1);
        }

        // Convert both to UTC
        ZonedDateTime startUtc = startZoned.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc = endZoned.withZoneSameInstant(ZoneOffset.UTC);

        //Get minutes from midnight of the reference day (we use the UTC day)
        long startMinutes = startUtc.toLocalTime().toSecondOfDay() / 60;
        long endMinutes = endUtc.toLocalTime().toSecondOfDay() / 60;
        //Adjust for possible day shift (if endUtc is on the next day)
        if (endUtc.toLocalDate().isAfter(startUtc.toLocalDate())) {
            endMinutes += 24 * 60;
        }
        return new int[]{(int) startMinutes, (int) endMinutes};
    }

    // Converts "UTC+1" or "UTC-5" to "UTC+01:00" which Java's ZoneId.of() requires.
    // Named timezones like "Europe/Berlin" are returned as-is.
    private static String normalizeUtcOffset(String tz) {
        if (tz == null) return "UTC";
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("^UTC([+-])(\\d{1,2})$").matcher(tz);
        if (m.matches()) {
            String sign = m.group(1);
            String hours = String.format("%02d", Integer.parseInt(m.group(2)));
            return "UTC" + sign + hours + ":00";
        }
        return tz;
    }

    // calculated overlap in minutes between two intervals of minutes
    public static long computeOverlapMinutes(int[] interval1, int[] interval2) {
        int start1 = interval1[0];
        int end1 = interval1[1];
        int start2 = interval2[0];
        int end2 = interval2[1];

        long overlapStart = Math.max(start1, start2);
        long overlapEnd = Math.min(end1, end2);
        return Math.max(0, overlapEnd - overlapStart);
    }
}
