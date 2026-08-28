package com.orrs.controller;

import com.orrs.model.Resource;
import com.orrs.model.User;
import com.orrs.repository.ResourceRepository;
import com.orrs.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private static final String SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

    @Autowired
    private ResourceRepository resourceRepository;

    private boolean isAdmin(User user) {
        return user != null && ("admin".equalsIgnoreCase(user.getRole()) || SUPER_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()));
    }

    private ResponseEntity<?> accessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied: Admin role required"));
    }

    // GET /resources - Get all resources (public)
    @GetMapping
    public ResponseEntity<?> getAllResources() {
        List<Resource> resources = resourceRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(resources);
    }

    // GET /resources/:id - Get resource by id (public)
    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable("id") String id) {
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Resource not found"));
        }
        return ResponseEntity.ok(resourceOpt.get());
    }

    // POST /resources - Admin creates resource
    @PostMapping
    public ResponseEntity<?> createResource(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Resource request) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Resource name is required"));
        }

        Resource resource = new Resource();
        resource.setName(request.getName().trim());
        resource.setPrice(request.getPrice());
        resource.setCreatedBy(currentUser.getId());

        resourceRepository.save(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(resource);
    }

    // PUT /resources/:id - Admin updates resource
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResource(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable("id") String id, @RequestBody Resource request) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Resource not found"));
        }

        Resource resource = resourceOpt.get();
        if (request.getName() != null) {
            resource.setName(request.getName().trim());
        }
        resource.setPrice(request.getPrice());

        resourceRepository.save(resource);
        return ResponseEntity.ok(resource);
    }

    // DELETE /resources/:id - Admin deletes resource
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable("id") String id) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Resource not found"));
        }

        resourceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }
}
