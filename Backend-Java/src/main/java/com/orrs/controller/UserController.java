package com.orrs.controller;

import com.orrs.model.Request;
import com.orrs.model.Resource;
import com.orrs.model.User;
import com.orrs.repository.RequestRepository;
import com.orrs.repository.ResourceRepository;
import com.orrs.repository.UserRepository;
import com.orrs.security.CustomUserDetails;
import com.orrs.service.CloudinaryService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private static final String SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private boolean isAdmin(User user) {
        return user != null && ("admin".equalsIgnoreCase(user.getRole()) || SUPER_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()));
    }

    private boolean isSuperAdmin(User user) {
        return user != null && SUPER_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail());
    }

    private ResponseEntity<?> accessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
    }

    // GET /users - Get all users (admin only)
    @GetMapping
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(users);
    }

    // POST /users - Admin adds user by email
    @PostMapping
    public ResponseEntity<?> addAllowedUser(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> body) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> existingOpt = userRepository.findByEmail(normalizedEmail);

        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();
            if (!existing.isAllowed()) {
                existing.setAllowed(true);
                userRepository.save(existing);
                return ResponseEntity.ok(Map.of("message", "User activated successfully", "user", existing));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "User already exists and is activated"));
        }

        User newUser = new User();
        newUser.setEmail(normalizedEmail);
        // Generate random secure password
        String randomPassword = UUID.randomUUID().toString().substring(0, 12);
        newUser.setPassword(passwordEncoder.encode(randomPassword));
        newUser.setAllowed(true);
        newUser.setRole("user");
        newUser.setFullName("");

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User added successfully. They can now log in.",
                "user", newUser
        ));
    }

    // GET /users/search - Search users (admin only)
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestParam("q") String q) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Search query is required"));
        }

        List<User> users = userRepository.searchUsers(q.trim());
        return ResponseEntity.ok(users);
    }

    // GET /users/me - Get own profile
    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUser().getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(user);
    }

    // PUT /users/me/profile - Update own profile
    @PutMapping("/me/profile")
    public ResponseEntity<?> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "aadhaarPhoto", required = false) MultipartFile aadhaarPhoto,
            @RequestParam(value = "panCardPhoto", required = false) MultipartFile panCardPhoto) {

        try {
            User user = userRepository.findById(userDetails.getUser().getId()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            return handleProfileUpdate(user, fullName, phone, address, profilePhoto, aadhaarPhoto, panCardPhoto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /users/:id/profile - Admin updates user profile
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") String id,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "aadhaarPhoto", required = false) MultipartFile aadhaarPhoto,
            @RequestParam(value = "panCardPhoto", required = false) MultipartFile panCardPhoto) {

        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            return handleProfileUpdate(user, fullName, phone, address, profilePhoto, aadhaarPhoto, panCardPhoto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    // GET /users/:id/requests - Admin fetches user requests
    @GetMapping("/{id}/requests")
    public ResponseEntity<?> getUserRequests(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable("id") String id) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        try {
            List<Request> requests = requestRepository.findByUserIdOrderByCreatedAtDesc(new ObjectId(id));
            
            // Map requests to include populated resource/quantity details for frontend compatibility
            List<Map<String, Object>> mappedRequests = new ArrayList<>();
            for (Request req : requests) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", req.getId());
                map.put("_id", req.getId());
                map.put("userId", req.getUserId().toString());
                map.put("totalCost", req.getTotalCost());
                map.put("siteId", req.getSiteId() != null ? req.getSiteId().toString() : null);
                map.put("purpose", req.getPurpose());
                map.put("status", req.getStatus());
                map.put("rejectionReason", req.getRejectionReason());
                map.put("reviewedBy", req.getReviewedBy());
                map.put("reviewedAt", req.getReviewedAt());
                map.put("createdAt", req.getCreatedAt());
                map.put("updatedAt", req.getUpdatedAt());

                // Fallback for legacy frontend that expects single resource/quantity fields
                if (req.getItems() != null && !req.getItems().isEmpty()) {
                    Request.Item firstItem = req.getItems().get(0);
                    map.put("quantity_requested", firstItem.getQuantity());
                    
                    Optional<Resource> resOpt = resourceRepository.findById(firstItem.getResourceId().toString());
                    if (resOpt.isPresent()) {
                        map.put("resource", resOpt.get());
                    }
                }
                
                // Map the full items list as well
                List<Map<String, Object>> mappedItems = new ArrayList<>();
                if (req.getItems() != null) {
                    for (Request.Item item : req.getItems()) {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("resourceId", item.getResourceId().toString());
                        
                        Optional<Resource> resOpt = resourceRepository.findById(item.getResourceId().toString());
                        resOpt.ifPresent(resource -> itemMap.put("resource", resource));
                        mappedItems.add(itemMap);
                    }
                }
                map.put("items", mappedItems);
                
                mappedRequests.add(map);
            }

            return ResponseEntity.ok(mappedRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /users/role-by-email - Admin updates role by email (super admin only)
    @PutMapping("/role-by-email")
    public ResponseEntity<?> updateRoleByEmail(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> body) {
        User currentUser = userDetails.getUser();
        if (!isSuperAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied: Only super admin can manage roles"));
        }

        String email = body.get("email");
        String role = body.get("role");

        if (email == null || role == null || (!"user".equalsIgnoreCase(role) && !"admin".equalsIgnoreCase(role))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Valid email and role ('user' or 'admin') are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found with this email"));
        }

        User user = userOpt.get();
        user.setRole(role.toLowerCase());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User role updated successfully", "user", user));
    }

    // PUT /users/:id/role - Admin updates role by ID (super admin only)
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable("id") String id, @RequestBody Map<String, String> body) {
        User currentUser = userDetails.getUser();
        if (!isSuperAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied: Only super admin can manage roles"));
        }

        String role = body.get("role");
        if (role == null || (!"user".equalsIgnoreCase(role) && !"admin".equalsIgnoreCase(role))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role. Must be 'user' or 'admin'"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        user.setRole(role.toLowerCase());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User role updated successfully", "user", user));
    }

    // DELETE /users/:id - Admin deletes user (except super admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable("id") String id) {
        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        User userToDelete = userRepository.findById(id).orElse(null);
        if (userToDelete == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        if (SUPER_ADMIN_EMAIL.equalsIgnoreCase(userToDelete.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Cannot delete the super admin account"));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    private ResponseEntity<?> handleProfileUpdate(
            User user, String fullName, String phone, String address,
            MultipartFile profilePhoto, MultipartFile aadhaarPhoto, MultipartFile panCardPhoto) throws Exception {

        if (fullName != null) user.setFullName(fullName);
        
        // Validate phone number if provided (must be 10 digits or empty)
        if (phone != null) {
            String trimmedPhone = phone.trim();
            if (!trimmedPhone.isEmpty() && !trimmedPhone.matches("^\\d{10}$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Phone number must be exactly 10 digits"));
            }
            user.setPhone(trimmedPhone);
        }
        
        if (address != null) user.setAddress(address);

        // Upload files to Cloudinary if present
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            String url = cloudinaryService.uploadFile(profilePhoto);
            user.setProfilePhotoUrl(url);
        }
        if (aadhaarPhoto != null && !aadhaarPhoto.isEmpty()) {
            String url = cloudinaryService.uploadFile(aadhaarPhoto);
            user.setAadhaarPhotoUrl(url);
        }
        if (panCardPhoto != null && !panCardPhoto.isEmpty()) {
            String url = cloudinaryService.uploadFile(panCardPhoto);
            user.setPanCardPhotoUrl(url);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "user", user));
    }
}
