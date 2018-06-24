package com.exercise.patient.repository.impl;

import com.exercise.patient.entity.Patient;
import com.exercise.patient.repository.PatientSearchRepository;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.SearchQuery;

import java.util.Optional;

public class PatientSearchRepositoryImpl implements PatientSearchRepository {

    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    @Value("#{'${search.combination}'.split(',')}")
    private String[] searchFields;

    @Override
    public Page<Patient> search(Pageable pageable, Optional<String> q, Optional<String> sort) {

        SearchQuery searchQuery = null;

        if (q.isPresent() && !q.get().isEmpty()) {
            searchQuery = new NativeSearchQuery(QueryBuilders
                    .multiMatchQuery(q.get(), searchFields));
        } else {
            searchQuery = new NativeSearchQuery(QueryBuilders.matchAllQuery());
        }

        searchQuery.setPageable(pageable);

        if (sort.isPresent()) {
            searchQuery
                    .addSort(new Sort(Sort.Direction.DESC, sort.get()));
        }

        return elasticsearchTemplate.queryForPage(searchQuery, Patient.class);
    }
}
