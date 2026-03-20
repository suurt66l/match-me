package com.example.web.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.Entity.Connection;
import com.example.web.Entity.ConnectionStatus;
import com.example.web.Entity.User;
import com.example.web.Repository.ConnectionRepository;
import com.example.web.Repository.UserRepository;

import jakarta.transaction.Transactional;

public class ConnectionService {
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public ConnectionService(ConnectionRepository connectionRepository, UserRepository userRepository) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
    }

    public Optional<Connection> findBetweenUsers(User user1, User user2) {
        return connectionRepository.findBetweenUsers(user1, user2);
    }

    // send a connection request from current user to target user
    @Transactional
    public Connection sendRequest(User requester, Long targetUserId) {
        if (requester.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send request to yourself");
        }

        User addressee = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        // Check if a connection already exists
        Optional<Connection> existing = connectionRepository.findBetweenUsers(requester, addressee);
        if (existing.isPresent()) {
            Connection conn = existing.get();
            // If already pending or accepted, cannot send new request
            if (conn.getStatus() == ConnectionStatus.PENDING || conn.getStatus() == ConnectionStatus.ACCEPTED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Connection already exists");
            }
            
            if (conn.getStatus() == ConnectionStatus.REJECTED) {
                conn.setStatus(ConnectionStatus.PENDING);
                return connectionRepository.save(conn);
            }

            // if BLOCKED, do not allow (block is permanent until unblocked)
            if (conn.getStatus() == ConnectionStatus.BLOCKED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot send request to this user");
            }
        }
        // No existing connection, create a new one
        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setAddressee(addressee);
        connection.setStatus(ConnectionStatus.PENDING);
        return connectionRepository.save(connection);
    }

    // accept a pending request (only the addressee can accept)
    @Transactional
    public Connection acceptRequest(User currentUser, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));
        // only the addressee can accept
        if (!connection.getAddressee().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the recipient can accept this request");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Connection is not pending");
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        return connectionRepository.save(connection);
    }

    // reject a pending request (either the addressee or the requester can reject)
    @Transactional
    public void rejectOrCancel(User currentUser, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                    .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));

        boolean isParticipant = connection.getRequester().getId().equals(currentUser.getId()) ||
                                connection.getAddressee().getId().equals(currentUser.getId());
        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this connection");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending connections can be rejected");
        }

        connectionRepository.delete(connection); // might be worth not deleting to keep history?
    }

    // block a user
    @Transactional
    public Connection blockUser(User currentUser, Long targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        Optional<Connection> existing = connectionRepository.findBetweenUsers(currentUser, target);
        Connection connection;
        if (existing.isPresent()) {
            connection = existing.get();
            connection.setStatus(ConnectionStatus.BLOCKED);
        } else {
            connection = new Connection();
            connection.setRequester(currentUser);
            connection.setAddressee(target);
            connection.setStatus(ConnectionStatus.BLOCKED);
        }
        return connectionRepository.save(connection);
    }

    // get all accepted connections (friends) for a user, returning list of user IDs
    public List<Long> getAcceptedConnectionIds(User user) {
        List<Connection> connections = connectionRepository.findAllAcceptedByUser(user);
        return connections.stream()
                .map(conn -> {
                    if (conn.getRequester().getId().equals(user.getId())) {
                        return conn.getAddressee().getId();
                    } else {
                        return conn.getRequester().getId();
                    }
                })
                .toList();
    }

    // Check if two users are ocnnected (accepted)
    public boolean areConnected(User user1, User user2) {
        return connectionRepository.findBetweenUsers(user1, user2)
                .map(conn -> conn.getStatus() == ConnectionStatus.ACCEPTED)
                .orElse(false);
    }
    
}
