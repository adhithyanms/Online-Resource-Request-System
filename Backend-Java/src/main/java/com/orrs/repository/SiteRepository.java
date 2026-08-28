package com.orrs.repository;

import com.orrs.model.Site;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends MongoRepository<Site, String> {
    List<Site> findAllByOrderByCreatedAtDesc();
    
    List<Site> findByAssignedUsersContainingOrderByCreatedAtDesc(ObjectId userId);
}
