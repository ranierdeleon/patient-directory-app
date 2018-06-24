package com.exercise.patient.service.impl;

import com.exercise.patient.entity.Patient;
import com.exercise.patient.exception.PatientException;
import com.exercise.patient.exception.PatientNotFoundException;
import com.exercise.patient.repository.PatientRepository;
import com.exercise.patient.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public Page<Patient> getAllByPage(Pageable pageable, Optional<String> q, Optional<String> sort) {
        return patientRepository.search(pageable, q, sort);
    }

    @Override
    public Patient getPatient(String id) throws PatientException {
        Optional<Patient> patient = patientRepository.findById(id);

        if (!patient.isPresent())
            throw new PatientNotFoundException(id);

        return patient.get();
    }

    @Override
    public void deletePatient(String id) throws PatientException {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (!optionalPatient.isPresent())
            throw new PatientNotFoundException(id);

        patientRepository.deleteById(id);
    }

    @Override
    public void softDeletePatient(String id) throws PatientException {
        Optional<Patient> optionalPatient = patientRepository.findById(id);

        if (!optionalPatient.isPresent())
            throw new PatientNotFoundException(id);

        Patient patient = optionalPatient.get();
        patient.setActive(false);

        patientRepository.save(patient);
    }

    @Override
    public String savePatient(Patient patient)  {
        Patient result = patientRepository.save(patient);

        return result.getId();
    }

    @Override
    public void updatePatient(String id, Patient patient)throws PatientException {
        Optional<Patient> result = patientRepository.findById(id);

        if (!result.isPresent())
            throw new PatientNotFoundException(id);

        patient.setId(id);

        patientRepository.save(patient);
    }
}
