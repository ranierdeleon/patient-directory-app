package com.exercise.patient.repository;

import com.exercise.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PatientSearchRepository {
    Page<Patient> search(Pageable pageable, Optional<String> q, Optional<String> sort);
}
