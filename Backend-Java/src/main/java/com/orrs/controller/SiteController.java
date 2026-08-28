package com.orrs.controller;

import com.orrs.model.Site;
import com.orrs.model.User;
import com.orrs.repository.SiteRepository;
import com.orrs.repository.UserRepository;
import com.orrs.security.CustomUserDetails;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/sites")
public class SiteController {

    private static final String SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private UserRepository userRepository;

    private boolean isAdmin(User user) {
        return user != null && ("admin".equalsIgnoreCase(user.getRole()) || SUPER_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()));
    }

    private ResponseEntity<?> accessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
    }

    // GET /sites - Admin gets all sites
    @GetMapping
    public ResponseEntity<?> getAllSites(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!isAdmin(userDetails.getUser())) {
            return accessDenied();
        }

        List<Site> sites = siteRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Site site : sites) {
            mapped.add(mapSiteResponse(site));
        }
        return ResponseEntity.ok(mapped);
    }

    // GET /sites/my-sites - User gets assigned sites
    @GetMapping("/my-sites")
    public ResponseEntity<?> getMySites(@AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        List<Site> sites = siteRepository.findByAssignedUsersContainingOrderByCreatedAtDesc(new ObjectId(userId));

        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Site site : sites) {
            mapped.add(mapSiteResponse(site));
        }
        return ResponseEntity.ok(mapped);
    }

    // POST /sites - Admin creates site
    @PostMapping
    public ResponseEntity<?> createSite(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody SiteCreationDto dto) {
        if (!isAdmin(userDetails.getUser())) {
            return accessDenied();
        }

        if (dto.getSiteName() == null || dto.getSiteAddress() == null || dto.getContactNumber() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Site name, address, and contact number are required"));
        }

        Site site = new Site();
        site.setSiteName(dto.getSiteName().trim());
        site.setSiteAddress(dto.getSiteAddress().trim());
        site.setContactNumber(dto.getContactNumber().trim());

        List<ObjectId> userIds = new ArrayList<>();
        if (dto.getAssignedUsers() != null) {
            for (String uId : dto.getAssignedUsers()) {
                if (uId != null && !uId.trim().isEmpty()) {
                    userIds.add(new ObjectId(uId.trim()));
                }
            }
        }
        site.setAssignedUsers(userIds);

        siteRepository.save(site);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapSiteResponse(site));
    }

    // PUT /sites/:id - Admin updates site
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSite(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") String id,
            @RequestBody SiteCreationDto dto) {

        if (!isAdmin(userDetails.getUser())) {
            return accessDenied();
        }

        Optional<Site> siteOpt = siteRepository.findById(id);
        if (siteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Site not found"));
        }

        Site site = siteOpt.get();
        if (dto.getSiteName() != null) {
            site.setSiteName(dto.getSiteName().trim());
        }
        if (dto.getSiteAddress() != null) {
            site.setSiteAddress(dto.getSiteAddress().trim());
        }
        if (dto.getContactNumber() != null) {
            site.setContactNumber(dto.getContactNumber().trim());
        }
        if (dto.getAssignedUsers() != null) {
            List<ObjectId> userIds = new ArrayList<>();
            for (String uId : dto.getAssignedUsers()) {
                if (uId != null && !uId.trim().isEmpty()) {
                    userIds.add(new ObjectId(uId.trim()));
                }
            }
            site.setAssignedUsers(userIds);
        }

        siteRepository.save(site);
        return ResponseEntity.ok(mapSiteResponse(site));
    }

    // DELETE /sites/:id - Admin deletes site
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSite(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable("id") String id) {
        if (!isAdmin(userDetails.getUser())) {
            return accessDenied();
        }

        Optional<Site> siteOpt = siteRepository.findById(id);
        if (siteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Site not found"));
        }

        siteRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Site deleted successfully"));
    }

    private Map<String, Object> mapSiteResponse(Site site) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", site.getId());
        map.put("_id", site.getId());
        map.put("siteName", site.getSiteName());
        map.put("siteAddress", site.getSiteAddress());
        map.put("contactNumber", site.getContactNumber());
        map.put("createdAt", site.getCreatedAt());
        map.put("updatedAt", site.getUpdatedAt());

        List<Map<String, Object>> usersList = new ArrayList<>();
        if (site.getAssignedUsers() != null) {
            for (ObjectId userId : site.getAssignedUsers()) {
                Optional<User> userOpt = userRepository.findById(userId.toString());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    Map<String, Object> uMap = new LinkedHashMap<>();
                    uMap.put("id", user.getId());
                    uMap.put("_id", user.getId());
                    uMap.put("email", user.getEmail());
                    uMap.put("fullName", user.getFullName());
                    uMap.put("phone", user.getPhone());
                    uMap.put("profilePhotoUrl", user.getProfilePhotoUrl());
                    usersList.add(uMap);
                }
            }
        }
        map.put("assignedUsers", usersList);
        return map;
    }

    public static class SiteCreationDto {
        private String siteName;
        private String siteAddress;
        private String contactNumber;
        private List<String> assignedUsers;

        public String getSiteName() {
            return siteName;
        }

        public void setSiteName(String siteName) {
            this.siteName = siteName;
        }

        public String getSiteAddress() {
            return siteAddress;
        }

        public void setSiteAddress(String siteAddress) {
            this.siteAddress = siteAddress;
        }

        public String getContactNumber() {
            return contactNumber;
        }

        public void setContactNumber(String contactNumber) {
            this.contactNumber = contactNumber;
        }

        public List<String> getAssignedUsers() {
            return assignedUsers;
        }

        public void setAssignedUsers(List<String> assignedUsers) {
            this.assignedUsers = assignedUsers;
        }
    }
}
