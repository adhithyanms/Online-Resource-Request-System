package com.orrs.controller;

import com.orrs.model.Request;
import com.orrs.model.User;
import com.orrs.repository.RequestRepository;
import com.orrs.repository.SiteRepository;
import com.orrs.security.CustomUserDetails;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private static final String SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private SiteRepository siteRepository;

    private boolean isAdmin(User user) {
        return user != null && ("admin".equalsIgnoreCase(user.getRole()) || SUPER_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()));
    }

    private ResponseEntity<?> accessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied: Admin role required"));
    }

    // GET /analytics/summary - Admin analytics dashboard summary
    @GetMapping("/summary")
    public ResponseEntity<?> getAnalyticsSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "startDate", required = false) String startDateStr,
            @RequestParam(value = "endDate", required = false) String endDateStr,
            @RequestParam(value = "siteId", required = false) String siteId,
            @RequestParam(value = "userId", required = false) String userId) {

        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        try {
            // Build Criteria for filtering
            Criteria criteria = new Criteria();
            List<Criteria> matchCriteria = new ArrayList<>();

            if (startDateStr != null && !startDateStr.isEmpty()) {
                Instant start = parseStartOfDay(startDateStr);
                if (start != null) {
                    matchCriteria.add(Criteria.where("createdAt").gte(start));
                }
            }

            if (endDateStr != null && !endDateStr.isEmpty()) {
                Instant end = parseEndOfDay(endDateStr);
                if (end != null) {
                    matchCriteria.add(Criteria.where("createdAt").lte(end));
                }
            }

            if (siteId != null && !siteId.trim().isEmpty()) {
                matchCriteria.add(Criteria.where("siteId").is(new ObjectId(siteId.trim())));
            }

            if (userId != null && !userId.trim().isEmpty()) {
                matchCriteria.add(Criteria.where("userId").is(new ObjectId(userId.trim())));
            }

            if (!matchCriteria.isEmpty()) {
                criteria.andOperator(matchCriteria.toArray(new Criteria[0]));
            }

            // 1. Status Distribution
            Aggregation statusAgg = Aggregation.newAggregation(
                    Aggregation.match(criteria),
                    Aggregation.group("status").count().as("count")
            );
            List<org.bson.Document> statusResults = mongoTemplate.aggregate(statusAgg, "requests", org.bson.Document.class).getMappedResults();
            List<Map<String, Object>> statusStats = new ArrayList<>();
            for (org.bson.Document doc : statusResults) {
                Map<String, Object> stat = new LinkedHashMap<>();
                stat.put("name", doc.get("_id"));
                stat.put("value", doc.get("count"));
                statusStats.add(stat);
            }

            // 2. Top Resources (grouping unwinded items)
            Aggregation resourceAgg = Aggregation.newAggregation(
                    Aggregation.match(criteria),
                    Aggregation.unwind("items"),
                    Aggregation.group("items.resourceId")
                            .count().as("requestCount")
                            .sum("items.quantity").as("totalQuantity"),
                    Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "requestCount"),
                    Aggregation.limit(10),
                    Aggregation.lookup("resources", "_id", "_id", "resourceInfo"),
                    Aggregation.unwind("resourceInfo"),
                    Aggregation.project()
                            .and("_id").as("_id")
                            .and("resourceInfo.name").as("name")
                            .and("requestCount").as("requestCount")
                            .and("totalQuantity").as("totalQuantity")
            );
            List<org.bson.Document> resourceStats = mongoTemplate.aggregate(resourceAgg, "requests", org.bson.Document.class).getMappedResults();

            // 3. KPI Counts
            org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query(criteria);
            long totalRequests = mongoTemplate.count(query, Request.class);

            org.springframework.data.mongodb.core.query.Query pendingQuery = new org.springframework.data.mongodb.core.query.Query(
                    new Criteria().andOperator(
                            criteria,
                            Criteria.where("status").is("pending")
                    )
            );
            long pendingRequests = mongoTemplate.count(pendingQuery, Request.class);

            org.springframework.data.mongodb.core.query.Query approvedQuery = new org.springframework.data.mongodb.core.query.Query(
                    new Criteria().andOperator(
                            criteria,
                            Criteria.where("status").is("approved")
                    )
            );
            long approvedRequests = mongoTemplate.count(approvedQuery, Request.class);

            long totalSites = siteRepository.count();

            // 4. Cost Statistics
            Aggregation costAgg = Aggregation.newAggregation(
                    Aggregation.match(criteria),
                    Aggregation.group("status").sum("totalCost").as("totalCost")
            );
            List<org.bson.Document> costResults = mongoTemplate.aggregate(costAgg, "requests", org.bson.Document.class).getMappedResults();
            double totalApprovedCost = 0.0;
            double totalPendingCost = 0.0;
            double totalCost = 0.0;

            for (org.bson.Document doc : costResults) {
                String status = doc.getString("_id");
                double cost = doc.getDouble("totalCost");
                totalCost += cost;
                if ("approved".equalsIgnoreCase(status)) {
                    totalApprovedCost = cost;
                } else if ("pending".equalsIgnoreCase(status)) {
                    totalPendingCost = cost;
                }
            }

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("totalRequests", totalRequests);
            summary.put("pendingRequests", pendingRequests);
            summary.put("approvedRequests", approvedRequests);
            summary.put("totalSites", totalSites);
            summary.put("totalApprovedCost", totalApprovedCost);
            summary.put("totalPendingCost", totalPendingCost);
            summary.put("totalCost", totalCost);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("summary", summary);
            response.put("statusStats", statusStats);
            response.put("resourceStats", resourceStats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    // GET /analytics/trends - Trends aggregated by day
    @GetMapping("/trends")
    public ResponseEntity<?> getAnalyticsTrends(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "days", defaultValue = "7") int days) {

        User currentUser = userDetails.getUser();
        if (!isAdmin(currentUser)) {
            return accessDenied();
        }

        try {
            Instant startDate = Instant.now().minus(days, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
            org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query();
            query.addCriteria(Criteria.where("createdAt").gte(startDate));
            List<Request> requests = mongoTemplate.find(query, Request.class);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
                    .withZone(ZoneId.of("UTC"));

            Map<String, Map<String, Object>> dateMap = new TreeMap<>(); // Sorted ascending by date

            // Prefill dates with default zeroes so charts render nicely
            for (int i = 0; i <= days; i++) {
                Instant d = startDate.plus(i, ChronoUnit.DAYS);
                String dateStr = formatter.format(d);
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("date", dateStr);
                row.put("totalCost", 0.0);
                row.put("approved", 0);
                row.put("approvedCost", 0.0);
                row.put("pending", 0);
                row.put("pendingCost", 0.0);
                row.put("rejected", 0);
                row.put("rejectedCost", 0.0);
                dateMap.put(dateStr, row);
            }

            for (Request req : requests) {
                if (req.getCreatedAt() == null) continue;
                String dateStr = formatter.format(req.getCreatedAt());

                Map<String, Object> dayRow = dateMap.computeIfAbsent(dateStr, k -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("date", k);
                    map.put("totalCost", 0.0);
                    map.put("approved", 0);
                    map.put("approvedCost", 0.0);
                    map.put("pending", 0);
                    map.put("pendingCost", 0.0);
                    map.put("rejected", 0);
                    map.put("rejectedCost", 0.0);
                    return map;
                });

                String status = req.getStatus() != null ? req.getStatus().toLowerCase() : "pending";
                double cost = req.getTotalCost();

                dayRow.put("totalCost", (double) dayRow.get("totalCost") + cost);

                if (dayRow.containsKey(status)) {
                    dayRow.put(status, (int) dayRow.get(status) + 1);
                } else {
                    dayRow.put(status, 1);
                }

                String costKey = status + "Cost";
                if (dayRow.containsKey(costKey)) {
                    dayRow.put(costKey, (double) dayRow.get(costKey) + cost);
                } else {
                    dayRow.put(costKey, cost);
                }
            }

            return ResponseEntity.ok(new ArrayList<>(dateMap.values()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    private Instant parseStartOfDay(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            if (dateStr.length() == 10) {
                return Instant.parse(dateStr + "T00:00:00Z");
            }
            return Instant.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    private Instant parseEndOfDay(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            if (dateStr.length() == 10) {
                return Instant.parse(dateStr + "T23:59:59.999Z");
            }
            return Instant.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }
}
