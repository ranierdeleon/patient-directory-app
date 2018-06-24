let backendHost;

const hostname = window && window.location && window.location.hostname;
console.log('hostname: ' + hostname);
if(hostname === 'localhost') {
    backendHost = 'http://localhost:8080';
} else if (hostname === '192.168.0.138') {
    backendHost = 'http://192.168.0.138:8080';
} else {
    backendHost = 'https://patient-directory-be-patient-panther.cfapps.io';
}

export const API_ROOT = backendHost;