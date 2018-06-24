package com.exercise.patient;

import com.exercise.patient.filter.AuthFilter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

import java.io.FileInputStream;
import java.io.IOException;

@SpringBootApplication
public class PatientApplication {
    private final static Logger LOG = LoggerFactory.getLogger(PatientApplication.class);

    public static void main(String[] args) {

        ConfigurableApplicationContext ctx = SpringApplication.run(PatientApplication.class, args);

        String firebaseKeys = ctx.getEnvironment().getProperty("firebase.keys");
        String firebaseDBUrl = ctx.getEnvironment().getProperty("firebase.db.url");

        try {
            FileInputStream serviceAccount =
                    new FileInputStream(PatientApplication.class.getResource(firebaseKeys).getFile());

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(firebaseDBUrl)
                    .build();

            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            LOG.error(e.getLocalizedMessage());
        }
    }

    @Bean
    public FilterRegistrationBean<AuthFilter> loggingFilter(){
        FilterRegistrationBean<AuthFilter> registrationBean
                = new FilterRegistrationBean<>();

        registrationBean.setFilter(new AuthFilter());
        registrationBean.addUrlPatterns("/patients/*");

        return registrationBean;
    }
}
