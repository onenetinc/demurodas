firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        window.location.replace('/');

    } else {

        document.getElementById('waitingContainer').style.display = 'none';

    }

});

const signInHeading = document.getElementById('signInHeading');
const emailError = document.getElementById('emailError');
const email = document.getElementById('email');
const passwordError = document.getElementById('passwordError');
const password = document.getElementById('password-2')
const submitButton = document.getElementById('submit');
const formError = document.getElementById('globalError');

const urlParams = new URLSearchParams(window.location.search);
const emailAddress = urlParams.get('email');

if (emailAddress) {

    signInHeading.innerText = 'Please sign in with your new email address';
    email.value = emailAddress;

}


const signInEmailPassword = async () => {

    try {

        submitButton.value = 'Please wait...';
        submitButton.removeEventListener('click', signInEmailPassword);

        clearErrors();

        await firebase.auth().signInWithEmailAndPassword(email.value, password.value);

        if (emailAddress) {

            window.location.replace('/u/profile-settings?success=true');

        } else {

            window.location.replace('/');

        }

    } catch (err) {

        handleError(err);

    }

}

submitButton.addEventListener('click', signInEmailPassword);

document.body.addEventListener('keyup', (event) => {

    if (event.keyCode === 13 || event.which === 13) {

        submitButton.click();
        
    }

});

const handleError = (err) => {

    if (!err.code) {

        formError.style.display = 'block';

    } else {

        switch (err.code) {

            case 'auth/user-not-found':
                emailError.classList.add('input_label_error');
                emailError.innerText = 'Sorry, this account does not exist';
                email.classList.add('input_field_error');
                break;

            case 'auth/wrong-password':
                passwordError.classList.add('input_label_error');
                passwordError.innerText = 'Sorry, this password is incorrect';
                password.classList.add('input_field_error');
                break;

            default:
                formError.style.display = 'block';

        }

    }

    submitButton.value = 'Submit';
    submitButton.addEventListener('click', signInEmailPassword);
    Sentry.captureException(err);

}

const clearErrors = () => {

    emailError.classList.remove('input_label_error');
    emailError.innerText = 'Email address';
    email.classList.remove('input_field_error');

    passwordError.classList.remove('input_label_error');
    passwordError.innerText = 'Password';
    password.classList.remove('input_field_error');

    formError.style.display = 'none';

}