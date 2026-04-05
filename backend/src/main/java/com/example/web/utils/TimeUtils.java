package com.example.web.utils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

// TimeUtils handles all time-related calculations for the matching algorithm.
// The main challenge: two users may be in different timezones.
// To compare their play schedules, we convert both to UTC (universal time)
// and then calculate how many minutes they overlap.
public class TimeUtils {

    // Used to parse time strings like "14:30" into a LocalTime object
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // Converts a user's local play time range (e.g. "22:00-02:00" in "UTC+3")
    // into UTC minutes from midnight.
    // Returns an int array with two values: [startMinutes, endMinutes]
    // Minutes are counted from 00:00 UTC — so 60 = 1:00 AM, 120 = 2:00 AM, etc.
    // endMinutes can exceed 1440 (24*60) if the session crosses midnight.
    public static int[] convertTimeRangeToUtcMinutes(String timeRange, String timezoneId) {
        // timeRange is stored as "HH:mm-HH:mm", e.g. "20:00-23:00"
        String[] parts = timeRange.split("-");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time range format: " + timeRange);
        }

        LocalTime startLocalTime = LocalTime.parse(parts[0], TIME_FORMATTER);
        LocalTime endLocalTime = LocalTime.parse(parts[1], TIME_FORMATTER);

        // Convert the timezone string to a Java ZoneId.
        // e.g. "UTC+3" → "UTC+03:00" (the format Java requires)
        ZoneId userTimezone = ZoneId.of(normalizeUtcOffset(timezoneId));

        // We need a reference date to do timezone conversion.
        // The actual date doesn't matter — we just need one to do the math.
        LocalDate referenceDate = LocalDate.of(2024, 1, 1);

        ZonedDateTime startInUserTimezone = ZonedDateTime.of(referenceDate, startLocalTime, userTimezone);
        ZonedDateTime endInUserTimezone = ZonedDateTime.of(referenceDate, endLocalTime, userTimezone);

        // If the end time is earlier than the start, the session crosses midnight.
        // Example: 23:00 to 01:00 — we add a day to the end to make the math work.
        if (endInUserTimezone.isBefore(startInUserTimezone)) {
            endInUserTimezone = endInUserTimezone.plusDays(1);
        }

        // Convert both times to UTC
        ZonedDateTime startUtc = startInUserTimezone.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc = endInUserTimezone.withZoneSameInstant(ZoneOffset.UTC);

        // Convert UTC times to "minutes since midnight"
        long startMinutes = startUtc.toLocalTime().toSecondOfDay() / 60;
        long endMinutes = endUtc.toLocalTime().toSecondOfDay() / 60;

        // If the UTC end time landed on the next day (after the timezone shift),
        // we add 24*60 so the number is still larger than startMinutes
        if (endUtc.toLocalDate().isAfter(startUtc.toLocalDate())) {
            endMinutes += 24 * 60;
        }

        return new int[]{(int) startMinutes, (int) endMinutes};
    }

    // Java's ZoneId requires offsets like "UTC+01:00", but users store "UTC+1".
    // This method converts the short form to the long form.
    // Named timezones like "Europe/Tallinn" are returned unchanged.
    private static String normalizeUtcOffset(String timezone) {
        if (timezone == null) return "UTC";

        // Check if it matches the pattern "UTC+1", "UTC-5", "UTC+12", etc.
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("^UTC([+-])(\\d{1,2})$")
                .matcher(timezone);

        if (matcher.matches()) {
            String sign = matcher.group(1);               // "+" or "-"
            // %02d pads single digits with a zero: "1" → "01"
            String hours = String.format("%02d", Integer.parseInt(matcher.group(2)));
            return "UTC" + sign + hours + ":00";          // e.g. "UTC+01:00"
        }

        // Already a valid named timezone — return as-is
        return timezone;
    }

    // Given two time intervals (each as [startMinutes, endMinutes]),
    // returns how many minutes they overlap.
    // Returns 0 if there is no overlap at all.
    //
    // Example:
    //   User A plays 20:00–23:00 UTC → [1200, 1380]
    //   User B plays 22:00–01:00 UTC → [1320, 1500]
    //   Overlap: 1320 to 1380 = 60 minutes
    public static long computeOverlapMinutes(int[] interval1, int[] interval2) {
        int start1 = interval1[0];
        int end1 = interval1[1];
        int start2 = interval2[0];
        int end2 = interval2[1];

        // The overlap starts at whichever interval starts later
        long overlapStart = Math.max(start1, start2);
        // The overlap ends at whichever interval ends sooner
        long overlapEnd = Math.min(end1, end2);

        // If overlapEnd <= overlapStart, there is no overlap — return 0
        return Math.max(0, overlapEnd - overlapStart);
    }
}
