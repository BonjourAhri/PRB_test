package com.amas.api.repository;

import com.amas.api.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Resource repository.
 */
@Repository
public interface ResourceRepository extends PagingAndSortingRepository<Resource, Long> { }