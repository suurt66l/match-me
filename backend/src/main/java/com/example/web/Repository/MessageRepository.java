package com.example.web.Repository;

import com.example.web.Entity.Message;
import com.example.web.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetches all messages between two users, newest first (for pagination)
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.recipient = :user2) OR " +
           "(m.sender = :user2 AND m.recipient = :user1) " +
           "ORDER BY m.timestamp DESC")
    Page<Message> findConversation(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);

    // Returns how many unread messages the recipient has from each sender.
    // Used to show unread badges in the chat sidebar.
    @Query("SELECT m.sender.id, COUNT(m) FROM Message m WHERE m.recipient = :recipient AND m.read = false GROUP BY m.sender.id")
    List<Object[]> countUnreadGroupedBySender(@Param("recipient") User recipient);

    // Marks all unread messages from a specific sender to a recipient as read.
    // @Modifying is required for UPDATE/DELETE queries in Spring Data JPA.
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.read = true WHERE m.recipient = :recipient AND m.sender = :sender AND m.read = false")
    void markAsRead(@Param("recipient") User recipient, @Param("sender") User sender);

    // Returns the timestamp of the latest message between the given user and each of their conversation partners.
    // Used to sort the chat sidebar by most recently active conversation.
    @Query("SELECT CASE WHEN m.sender = :user THEN m.recipient.id ELSE m.sender.id END, MAX(m.timestamp) " +
           "FROM Message m WHERE m.sender = :user OR m.recipient = :user " +
           "GROUP BY CASE WHEN m.sender = :user THEN m.recipient.id ELSE m.sender.id END")
    List<Object[]> findLastMessageTimePerConversation(@Param("user") User user);
}
