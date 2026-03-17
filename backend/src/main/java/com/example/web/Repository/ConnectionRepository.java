package com.example.web.Repository;

import com.example.web.Entity.Connection;
import com.example.web.Entity.ConnectionStatus;
import com.example.web.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    // Find connection between two users (in either direction)
    @Query("SELECT c FROM Connection c WHERE (c.requester = :user1 AND c.addressee = :user2) OR (c.requester = :user2 AND c.addressee = :user1)")
    Optional<Connection> findBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    // Find all connections for a user (as requester or addressee) with a specific status
    @Query("SELECT c FROM Connection c WHERE (c.requester = :user OR c.addressee = :user) AND c.status = :status")
    List<Connection> findAllByUserAndStatus(@Param("user") User user, @Param("status") ConnectionStatus status);

    // Find all connections for a user (both directions) regardless of status
    @Query("SELECT c FROM Connection c WHERE c.requester = :user OR c.addressee = :user")
    List<Connection> findAllByUser(@Param("user") User user);

    // Find all accepted connections for a user (to list friends)
    @Query("SELECT c FROM Connection c WHERE (c.requester = :user OR c.addressee = :user) AND c.status = 'ACCEPTED'")
    List<Connection> findAllAcceptedByUser(@Param("user") User user);
}