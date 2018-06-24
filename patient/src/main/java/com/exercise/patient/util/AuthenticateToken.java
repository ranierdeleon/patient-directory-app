package com.exercise.patient.util;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AuthenticateToken {
    private final static Logger LOG = LoggerFactory.getLogger(AuthenticateToken.class);


    public static boolean authenticate(String idTokenString) {

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idTokenString);
            String uid = decodedToken.getUid();
            if (uid != null) {
                return true;
            } else {
                LOG.error("Invalid ID token.");
            }
        } catch (FirebaseAuthException e) {
            LOG.error(e.getLocalizedMessage());
        }

        return false;
    }
}
