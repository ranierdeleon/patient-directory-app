package com.exercise.patient.controller;

import com.exercise.patient.entity.Patient;
import com.exercise.patient.exception.PatientException;
import com.exercise.patient.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
public class ManagePatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping("/patients")
    public Page<Patient> getAllByPage(Pageable pageable,
                                      @RequestParam(required = false, name="q") Optional<String> q,
                                      @RequestParam(required = false, name="sort") Optional<String> sort) {
        return patientService.getAllByPage(pageable, q, sort);
    }

    @GetMapping("/patients/{id}")
    public Patient getPatient(@PathVariable String id) throws PatientException {
        return patientService.getPatient(id);
    }

    @DeleteMapping("/patients/{id}")
    public void deletePatient(@PathVariable String id) throws PatientException {
        patientService.deletePatient(id);
    }

    @PutMapping("/patients/safe-delete/{id}")
    public ResponseEntity<Object> softDeletePatient(@PathVariable String id) throws PatientException {
        patientService.softDeletePatient(id);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/patients")
    public ResponseEntity<Object> savePatient(@RequestBody Patient patient) {
        String id = patientService.savePatient(patient);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(id).toUri();

        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<Object> updatePatient(@PathVariable String id, @RequestBody Patient patient) throws PatientException {
        patientService.updatePatient(id, patient);

        return ResponseEntity.ok().build();
    }

}
