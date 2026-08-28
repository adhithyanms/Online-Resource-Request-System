package com.orrs.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "sites")
public class Site {
    @Id
    private String id;

    private String siteName;

    private String siteAddress;

    private String contactNumber;

    private List<ObjectId> assignedUsers = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Site() {
    }

    public Site(String id, String siteName, String siteAddress, String contactNumber, List<ObjectId> assignedUsers, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.siteName = siteName;
        this.siteAddress = siteAddress;
        this.contactNumber = contactNumber;
        this.assignedUsers = assignedUsers;
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

    public List<ObjectId> getAssignedUsers() {
        return assignedUsers;
    }

    public void setAssignedUsers(List<ObjectId> assignedUsers) {
        this.assignedUsers = assignedUsers;
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
}
