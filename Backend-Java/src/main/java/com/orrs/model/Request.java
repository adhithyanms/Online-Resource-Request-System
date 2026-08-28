package com.orrs.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "requests")
public class Request {
    @Id
    private String id;

    private ObjectId userId;

    private List<Item> items;

    private double totalCost = 0.0;

    private ObjectId siteId;

    private String purpose;

    private String status = "pending"; // 'pending', 'approved', 'rejected'

    private String rejectionReason;

    private String reviewedBy;

    private Instant reviewedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Request() {
    }

    public Request(String id, ObjectId userId, List<Item> items, double totalCost, ObjectId siteId, String purpose, String status, String rejectionReason, String reviewedBy, Instant reviewedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.items = items;
        this.totalCost = totalCost;
        this.siteId = siteId;
        this.purpose = purpose;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.reviewedBy = reviewedBy;
        this.reviewedAt = reviewedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String get_id() {
        return id;
    }

    public ObjectId getUserId() {
        return userId;
    }

    public void setUserId(ObjectId userId) {
        this.userId = userId;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public ObjectId getSiteId() {
        return siteId;
    }

    public void setSiteId(ObjectId siteId) {
        this.siteId = siteId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class Item {
        private ObjectId resourceId;
        private int quantity;

        public Item() {
        }

        public Item(ObjectId resourceId, int quantity) {
            this.resourceId = resourceId;
            this.quantity = quantity;
        }

        public ObjectId getResourceId() {
            return resourceId;
        }

        public void setResourceId(ObjectId resourceId) {
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
