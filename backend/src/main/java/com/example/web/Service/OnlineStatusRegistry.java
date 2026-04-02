package com.example.web.Service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Keeps track of which users are currently connected via WebSocket.
 * Stored in memory (not the database) — resets when the server restarts.
 * ConcurrentHashMap is used because multiple WebSocket connections can arrive at the same time.
 */
@Service
public class OnlineStatusRegistry {
    private final Set<Long> onlineUserIds = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void setOnline(Long userId) {
        onlineUserIds.add(userId);
    }

    public void setOffline(Long userId) {
        onlineUserIds.remove(userId);
    }

    public boolean isOnline(Long userId) {
        return onlineUserIds.contains(userId);
    }

    public Set<Long> getOnlineUserIds() {
        return Collections.unmodifiableSet(onlineUserIds);
    }
}
