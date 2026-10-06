package com.academiaflora;
import org.springframework.web.server.ResponseStatusException;.bind.annotation.*;import org.springframework.web.multipart.MultipartFile;import org.springframework.http.*;import java.time.*;import java.util.*;
@RestController @RequestMapping("/api") @CrossOrigin(origins="*")
public class ApiController{
 final UserRepo users; final AssignmentRepo assignments; final SubmissionRepo submissions;
 ApiController(UserRepo u,AssignmentRepo a,SubmissionRepo s){users=u;assignments=a;submissions=s;}
 record Login(String username,String password){} record Grade(Integer marks,String remarks){}
 @GetMapping("/health") Map<String,String> health(){return Map.of("status","UP");}
 @PostMapping("/login") Map<String,Object> login(@RequestBody Login x){User u=users.findByUsernameAndPassword(x.username(),x.password()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid credentials"));return Map.of("id",u.id,"name",u.name,"username",u.username,"role",u.role);}
 @GetMapping("/assignments") List<Assignment> all(){return assignments.findAll();}
 @PostMapping(value="/assignments",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) Assignment create(@RequestParam String title,@RequestParam String description,@RequestParam String deadline){return assignments.save(new Assignment(title,description,LocalDateTime.parse(deadline)));}
 @GetMapping("/submissions/student/{id}") List<Submission> student(@PathVariable Long id){return submissions.findByStudentId(id);}
 @GetMapping("/submissions") List<Submission> allSubmissions(){return submissions.findAll();}
 @PostMapping(value="/submissions/{aid}",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) Submission submit(@PathVariable Long aid,@RequestParam Long studentId,@RequestParam MultipartFile file)throws Exception{Assignment a=assignments.findById(aid).orElseThrow();Submission s=submissions.findByAssignmentIdAndStudentId(aid,studentId).orElse(new Submission());s.assignmentId=aid;s.studentId=studentId;s.fileName=file.getOriginalFilename();s.fileData=file.getBytes();s.submittedAt=LocalDateTime.now();s.late=s.submittedAt.isAfter(a.deadline);return submissions.save(s);}
 @PutMapping("/submissions/{id}/grade") Submission grade(@PathVariable Long id,@RequestBody Grade g){Submission s=submissions.findById(id).orElseThrow();s.marks=g.marks();s.remarks=g.remarks();return submissions.save(s);}
}
