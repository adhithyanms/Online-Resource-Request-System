package com.orrs.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "profiles")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String fullName = "";

    private String role = "user"; // 'user' or 'admin'

    private boolean isAllowed = false;

    private String phone = "";

    private String address = "";

    private String profilePhotoUrl = "";

    private String aadhaarPhotoUrl = "";

    private String panCardPhotoUrl = "";

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public User() {
    }

    public User(String id, String email, String password, String fullName, String role, boolean isAllowed, String phone, String address, String profilePhotoUrl, String aadhaarPhotoUrl, String panCardPhotoUrl, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.isAllowed = isAllowed;
        this.phone = phone;
        this.address = address;
        this.profilePhotoUrl = profilePhotoUrl;
        this.aadhaarPhotoUrl = aadhaarPhotoUrl;
        this.panCardPhotoUrl = panCardPhotoUrl;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isAllowed() {
        return isAllowed;
    }

    public void setAllowed(boolean allowed) {
        isAllowed = allowed;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getAadhaarPhotoUrl() {
        return aadhaarPhotoUrl;
    }

    public void setAadhaarPhotoUrl(String aadhaarPhotoUrl) {
        this.aadhaarPhotoUrl = aadhaarPhotoUrl;
    }

    public String getPanCardPhotoUrl() {
        return panCardPhotoUrl;
    }

    public void setPanCardPhotoUrl(String panCardPhotoUrl) {
        this.panCardPhotoUrl = panCardPhotoUrl;
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
