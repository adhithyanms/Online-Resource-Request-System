package com.orrs.controller;

import com.orrs.model.User;
import com.orrs.repository.UserRepository;
import com.orrs.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {
        try {
            if (request.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required"));
            }

            String email = request.getEmail().toLowerCase().trim();
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
            }

            User user = userOpt.get();

            if (!user.isAllowed()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "Your account has not been activated by admin. Please contact the administrator."
                ));
            }

            String rawPassword = request.getPassword() != null ? request.getPassword() : "";
            if (!passwordEncoder.matches(rawPassword, user.getPassword() != null ? user.getPassword() : "")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
            }

            String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

            return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getEmail(), user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/google-signin")
    public ResponseEntity<?> googleSignin(@RequestBody GoogleSigninRequest request) {
        try {
            if (request.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required"));
            }

            String email = request.getEmail().toLowerCase().trim();
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
                if (!user.isAllowed()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                            "message", "Your account has not been activated by admin. Please contact the administrator."
                    ));
                }

                // Update fullName if not set
                if ((user.getFullName() == null || user.getFullName().isEmpty()) && request.getFullName() != null) {
                    user.setFullName(request.getFullName());
                    userRepository.save(user);
                }
            } else {
                // New user - check if super admin
                boolean isSuperAdmin = email.equalsIgnoreCase(SUPER_ADMIN_EMAIL);
                
                user = new User();
                user.setEmail(email);
                user.setFullName(request.getFullName() != null ? request.getFullName() : "");
                user.setRole(isSuperAdmin ? "admin" : "user");
                user.setAllowed(isSuperAdmin);

                // Set a secure random password for OAuth user
                String randomPassword = UUID.randomUUID().toString().substring(0, 10);
                user.setPassword(passwordEncoder.encode(randomPassword));

                userRepository.save(user);

                if (!isSuperAdmin) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                            "message", "Your account registration request has been submitted to the admin. Please wait for activation."
                    ));
                }
            }

            String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

            return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getEmail(), user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required"));
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Password must be at least 6 characters"));
            }

            String email = request.getEmail().toLowerCase().trim();
            Optional<User> existingOpt = userRepository.findByEmail(email);

            if (existingOpt.isPresent()) {
                User existing = existingOpt.get();
                if (!existing.isAllowed()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "An account activation request for this email has already been submitted and is pending admin approval."
                    ));
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "An account with this email is already registered and activated. Please log in."
                    ));
                }
            }

            User user = new User();
            user.setEmail(email);
            user.setFullName(request.getFullName() != null ? request.getFullName() : "");
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole("user");
            user.setAllowed(false); // Pending approval

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration request submitted successfully. Please wait for admin approval before logging in."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    public static class SigninRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class GoogleSigninRequest {
        private String email;
        private String fullName;
        private String googleId;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getGoogleId() {
            return googleId;
        }

        public void setGoogleId(String googleId) {
            this.googleId = googleId;
        }
    }

    public static class SignupRequest {
        private String email;
        private String password;
        private String fullName;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }

    public static class AuthResponse {
        private String token;
        private String id;
        private String email;
        private String role;

        public AuthResponse(String token, String id, String email, String role) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.role = role;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
