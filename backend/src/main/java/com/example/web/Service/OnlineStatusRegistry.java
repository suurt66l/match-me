package com.example.web.Service;

import org.springframework.stereotype.Service;

import com.example.web.DTO.GraphQL.OnlineStatusDto;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

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
    private final Sinks.Many<OnlineStatusDto> statusSink = Sinks.many().multicast().onBackpressureBuffer();

    public void setOnline(Long userId) {
        onlineUserIds.add(userId);

         // Emmiter for GraphQL subscriptions
        statusSink.tryEmitNext(new OnlineStatusDto(userId, true));
    }

    public void setOffline(Long userId) {
        onlineUserIds.remove(userId);

        // Emmiter for GraphQL subscriptions
        statusSink.tryEmitNext(new OnlineStatusDto(userId, false));
    }

    public boolean isOnline(Long userId) {
        return onlineUserIds.contains(userId);
    }

    public Set<Long> getOnlineUserIds() {
        return Collections.unmodifiableSet(onlineUserIds);
    }

    // Getter for GraphQL subscriptions
    public Flux<OnlineStatusDto> getOnlineStatusStream(){
        return statusSink.asFlux();
    }
}
