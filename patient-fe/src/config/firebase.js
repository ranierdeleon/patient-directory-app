import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyChHgOW_uG7vXeBwJHCcR-QhVaaXk6AdoQ",
    authDomain: "patient-directory-d6456.firebaseapp.com",
    databaseURL: "https://patient-directory-d6456.firebaseio.com",
    projectId: "patient-directory-d6456",
    storageBucket: "patient-directory-d6456.appspot.com",
    messagingSenderId: "265383629878"
};
firebase.initializeApp(config);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

export default firebase;