package com.exercise.patient.repository;

import com.exercise.patient.entity.Patient;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends ElasticsearchRepository<Patient, String>, PatientSearchRepository{

}
