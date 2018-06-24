package com.exercise.patient.exception;

public class PatientNotFoundException extends PatientException {

    public PatientNotFoundException(String patientId) {
        super("Patient not Found ID: " + patientId);
    }
}
