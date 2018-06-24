package com.exercise.patient.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import com.exercise.patient.util.AuthenticateToken;
import org.elasticsearch.common.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class AuthFilter implements Filter {
    private final static Logger LOG = LoggerFactory.getLogger(AuthFilter.class);
    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {
        LOG.info("Initializing filter :{}", this);
    }

    @Override
    public void doFilter (
    ServletRequest request,
    ServletResponse response,
    FilterChain chain) throws IOException, ServletException
    {

        HttpServletRequest req = (HttpServletRequest) request;

        String idToken = req.getHeader("Authorization");

        switch (req.getMethod()) {
            case "POST":
            case "GET":
            case "PUT":
            case "DELETE":
                if (Strings.isEmpty(idToken) || !AuthenticateToken.authenticate(idToken)) {
                    throw new ServletException("Invalid Token");
                }
                break;
        }

        chain.doFilter(request, response);
    }
    @Override
    public void destroy() {
        LOG.warn("Destructing filter :{}", this);
    }
}
