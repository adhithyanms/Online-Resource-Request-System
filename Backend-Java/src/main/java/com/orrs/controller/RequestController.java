package com.orrs.controller;

import com.orrs.model.Request;
import com.orrs.model.Resource;
import com.orrs.model.User;
import com.orrs.repository.RequestRepository;
import com.orrs.repository.ResourceRepository;
import com.orrs.repository.SiteRepository;
import com.orrs.repository.UserRepository;
import com.orrs.security.CustomUserDetails;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/requests")
public class RequestController {

    private static final String SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SiteRepository siteRepository;

    private boolean isAdmin(User user) {
        return user != null && ("admin".equalsIgnoreCase(user.getRole()) || SUPER_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()));
    }

    private ResponseEntity<?> accessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied: Admin role required"));
    }

    // GET /requests - Get all requests (admin only)
    @GetMapping
    public ResponseEntity<?> getAllRequests(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!isAdmin(userDetails.getUser())) {
            return accessDenied();
        }

        List<Request> requests = requestRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Request req : requests) {
            mapped.add(mapRequestResponse(req));
        }
        return ResponseEntity.ok(mapped);
    }

    // GET /requests/my-requests - Get current user's requests
    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(@AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        List<Request> requests = requestRepository.findByUserIdOrderByCreatedAtDesc(new ObjectId(userId));
        
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Request req : requests) {
            mapped.add(mapRequestResponse(req));
        }
        return ResponseEntity.ok(mapped);
    }

    // POST /requests - Create request
    @PostMapping
    public ResponseEntity<?> createRequest(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody RequestCreationDto dto) {
        try {
            if (dto.getItems() == null || dto.getItems().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Items are required"));
            }
            if (dto.getSiteId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Site ID is required"));
            }

            double totalCost = 0.0;
            List<Request.Item> items = new ArrayList<>();

            for (RequestCreationDto.ItemDto itemDto : dto.getItems()) {
                if (itemDto.getResourceId() == null) {
                    continue;
                }
                Optional<Resource> resOpt = resourceRepository.findById(itemDto.getResourceId());
                if (resOpt.isPresent()) {
                    Resource resource = resOpt.get();
                    totalCost += resource.getPrice() * itemDto.getQuantity();
                    items.add(new Request.Item(new ObjectId(itemDto.getResourceId()), itemDto.getQuantity()));
                }
            }

            Request request = new Request();
            request.setUserId(new ObjectId(userDetails.getUser().getId()));
            request.setItems(items);
            request.setSiteId(new ObjectId(dto.getSiteId()));
            request.setPurpose(dto.getPurpose() != null ? dto.getPurpose() : "");
            request.setTotalCost(totalCost);
            request.setStatus("pending");

            requestRepository.save(request);
            
            // Map and return populated request
            return ResponseEntity.status(HttpStatus.CREATED).body(mapRequestResponse(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /requests/:id/status - Approve/reject request (admin only)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {

        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        String status = body.get("status");
        String rejectionReason = body.get("rejectionReason");

        if (status == null || (!"approved".equals(status) && !"rejected".equals(status) && !"pending".equals(status))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid status value"));
        }

        Optional<Request> requestOpt = requestRepository.findById(id);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Request not found"));
        }

        Request request = requestOpt.get();
        request.setStatus(status);
        if ("rejected".equals(status)) {
            request.setRejectionReason(rejectionReason);
        } else {
            request.setRejectionReason(null);
        }
        request.setReviewedBy(currentUser.getId());
        request.setReviewedAt(Instant.now());

        requestRepository.save(request);
        return ResponseEntity.ok(mapRequestResponse(request));
    }

    // PUT /requests/:id - Update request fields (admin only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") String id,
            @RequestBody RequestCreationDto dto) {

        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        Optional<Request> requestOpt = requestRepository.findById(id);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Request not found"));
        }

        Request request = requestOpt.get();
        if (!"pending".equals(request.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Only pending requests can be edited"));
        }

        if (dto.getSiteId() != null) {
            request.setSiteId(new ObjectId(dto.getSiteId()));
        }
        if (dto.getPurpose() != null) {
            request.setPurpose(dto.getPurpose());
        }

        if (dto.getItems() != null) {
            double totalCost = 0.0;
            List<Request.Item> items = new ArrayList<>();

            for (RequestCreationDto.ItemDto itemDto : dto.getItems()) {
                if (itemDto.getResourceId() == null) {
                    continue;
                }
                Optional<Resource> resOpt = resourceRepository.findById(itemDto.getResourceId());
                if (resOpt.isPresent()) {
                    Resource resource = resOpt.get();
                    totalCost += resource.getPrice() * itemDto.getQuantity();
                    items.add(new Request.Item(new ObjectId(itemDto.getResourceId()), itemDto.getQuantity()));
                }
            }
            request.setItems(items);
            request.setTotalCost(totalCost);
        }

        requestRepository.save(request);
        return ResponseEntity.ok(mapRequestResponse(request));
    }

    private Map<String, Object> mapRequestResponse(Request req) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", req.getId());
        map.put("_id", req.getId());
        map.put("totalCost", req.getTotalCost());
        map.put("purpose", req.getPurpose());
        map.put("status", req.getStatus());
        map.put("rejectionReason", req.getRejectionReason());
        map.put("reviewedBy", req.getReviewedBy());
        map.put("reviewedAt", req.getReviewedAt());
        map.put("createdAt", req.getCreatedAt());
        map.put("updatedAt", req.getUpdatedAt());

        // Populate user (both userId and user properties)
        if (req.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(req.getUserId().toString());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userMap = new LinkedHashMap<>();
                userMap.put("id", user.getId());
                userMap.put("_id", user.getId());
                userMap.put("email", user.getEmail());
                userMap.put("fullName", user.getFullName());
                
                map.put("user", userMap);
                map.put("userId", userMap);
            } else {
                map.put("userId", req.getUserId().toString());
            }
        }

        // Populate site (both siteId and site properties)
        if (req.getSiteId() != null) {
            Optional<com.orrs.model.Site> siteOpt = siteRepository.findById(req.getSiteId().toString());
            if (siteOpt.isPresent()) {
                com.orrs.model.Site site = siteOpt.get();
                Map<String, Object> siteMap = new LinkedHashMap<>();
                siteMap.put("id", site.getId());
                siteMap.put("_id", site.getId());
                siteMap.put("siteName", site.getSiteName());
                siteMap.put("siteAddress", site.getSiteAddress());
                
                map.put("site", siteMap);
                map.put("siteId", siteMap);
            } else {
                map.put("siteId", req.getSiteId().toString());
            }
        }

        // Populate items' resourceId reference
        List<Map<String, Object>> itemsList = new ArrayList<>();
        if (req.getItems() != null) {
            for (Request.Item item : req.getItems()) {
                Map<String, Object> itemMap = new LinkedHashMap<>();
                itemMap.put("quantity", item.getQuantity());
                
                if (item.getResourceId() != null) {
                    Optional<Resource> resOpt = resourceRepository.findById(item.getResourceId().toString());
                    if (resOpt.isPresent()) {
                        itemMap.put("resourceId", resOpt.get());
                    } else {
                        itemMap.put("resourceId", item.getResourceId().toString());
                    }
                }
                itemsList.add(itemMap);
            }
        }
        map.put("items", itemsList);

        return map;
    }

    public static class RequestCreationDto {
        private List<ItemDto> items;
        private String siteId;
        private String purpose;

        public List<ItemDto> getItems() {
            return items;
        }

        public void setItems(List<ItemDto> items) {
            this.items = items;
        }

        public String getSiteId() {
            return siteId;
        }

        public void setSiteId(String siteId) {
            this.siteId = siteId;
        }

        public String getPurpose() {
            return purpose;
        }

        public void setPurpose(String purpose) {
            this.purpose = purpose;
        }

        public static class ItemDto {
            private String resourceId;
            private int quantity;

            public String getResourceId() {
                return resourceId;
            }

            public void setResourceId(String resourceId) {
                this.resourceId = resourceId;
            }

            public int getQuantity() {
                return quantity;
            }

            public void setQuantity(int quantity) {
                this.quantity = quantity;
            }
        }
    }
}
