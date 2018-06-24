package com.exercise.patient.service;

import com.exercise.patient.entity.Patient;
import com.exercise.patient.exception.PatientException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PatientService {

    Page<Patient> getAllByPage(Pageable pageable, Optional<String> q, Optional<String> sort);

    Patient getPatient(String id) throws PatientException;

    void deletePatient(String id) throws PatientException;

    void softDeletePatient(String id) throws PatientException;

    String savePatient(Patient patient);

    void updatePatient(String id, Patient patient) throws PatientException;

}
