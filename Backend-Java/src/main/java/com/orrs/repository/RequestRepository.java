package com.orrs.repository;

import com.orrs.model.Request;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends MongoRepository<Request, String> {
    List<Request> findAllByOrderByCreatedAtDesc();
    
    List<Request> findByUserIdOrderByCreatedAtDesc(ObjectId userId);
}
