package com.academiaflora;
import org.springframework.data.jpa.repository.*;import java.util.*;
interface UserRepo extends JpaRepository<User,Long>{Optional<User> findByUsernameAndPassword(String u,String p);}
interface AssignmentRepo extends JpaRepository<Assignment,Long>{}
interface SubmissionRepo extends JpaRepository<Submission,Long>{List<Submission> findByStudentId(Long id);Optional<Submission> findByAssignmentIdAndStudentId(Long a,Long s);}
