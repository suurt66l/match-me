package com.example.web.Repository;

import com.example.web.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // Finds all users whose email matches a LIKE pattern — used by the seed delete endpoint
    @Query("SELECT u FROM User u WHERE u.email LIKE :pattern")
    List<User> findByEmailLike(@Param("pattern") String pattern);
}