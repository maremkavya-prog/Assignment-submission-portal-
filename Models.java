package com.academiaflora;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name="users")
class User {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    String name, username, password, role;

    public User() {}

    User(String n, String u, String p, String r) {
        name = n;
        username = u;
        password = p;
        role = r;
    }
}

@Entity
class Assignment {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    String title, description;
    LocalDateTime deadline;

    public Assignment() {}

    Assignment(String t, String d, LocalDateTime l) {
        title = t;
        description = d;
        deadline = l;
    }
}

@Entity
class Submission {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    Long assignmentId, studentId;
    String fileName;
    LocalDateTime submittedAt;
    boolean late;
    Integer marks;
    String remarks;

    @Lob
    @Json
