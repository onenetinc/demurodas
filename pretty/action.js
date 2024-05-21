firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        window.location.replace('/');

    } else {

        document.getElementById('waitingContainer').style.display = 'none';

    }

});

const heading = document.getElementById('heading');
const emailError = document.getElementById('emailError');
const emailInput = document.getElementById('email');
const passwordError = document.getElementById('passwordError');
const passwordInput = document.getElementById('Password-3');
const passwordVerifyError = document.getElementById('passwordVerifyError');
const passwordVerifyInput = document.getElementById('Password-4');
const formError = document.getElementById('globalError');
const submitButton = document.getElementById('submit');


emailError.style.display = 'none';
emailInput.style.display = 'none';
passwordInput.style.display = 'none';
passwordVerifyInput.style.display = 'none';
formError.classList.add('global_error');
submitButton.style.display = 'none';

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const actionCode = urlParams.get('oobCode');
const apiKey = urlParams.get('apiKey');
const continueUrl = urlParams.get('continueUrl');

const handleResetPassword = async () => {

    try {

        submitButton.value = 'Please wait...';
        submitButton.removeEventListener('click', handleResetPassword);
        clearErrors();

        if (passwordInput.value !== passwordVerifyInput.value || !passwordInput.value || !passwordVerifyInput.value) {

            throw { code: 'custom/no-match' };

        } else {

            const email = await firebase.auth().verifyPasswordResetCode(actionCode);
            await firebase.auth().confirmPasswordReset(actionCode, passwordVerifyInput.value);
            await firebase.auth().signInWithEmailAndPassword(email, passwordVerifyInput.value);
            window.location.replace('/');

        }

    } catch (err) {

        switch (err.code) {

            case 'custom/no-match':
                passwordVerifyError.classList.add('input_label_error');
                passwordVerifyError.innerText = 'Sorry, these passwords need to match';
                passwordVerifyInput.classList.add('input_field_error');
                break;

            case 'auth/weak-password':
                passwordVerifyError.classList.add('input_label_error');
                passwordVerifyError.innerText = 'Sorry, your password needs at least 6 characters';
                passwordVerifyInput.classList.add('input_field_error');
                break;

            default:
                formError.style.display = 'block';
                Sentry.captureException(err);

        }

        submitButton.value = 'Submit';
        submitButton.addEventListener('click', handleResetPassword);

    }

}

switch (mode) {

    case 'resetPassword':
        passwordInput.style.display = 'block';
        passwordVerifyInput.style.display = 'block';
        submitButton.style.display = 'block';
        submitButton.addEventListener('click', handleResetPassword);
        break;
    
}

document.body.addEventListener('keyup', (event) => {

    if (event.keyCode === 13 || event.which === 13) {

        submitButton.click();
        
    }

});

const clearErrors = () => {

    passwordVerifyError.classList.remove('input_label_error');
    passwordVerifyError.innerText = 'Verify Password';
    passwordVerifyInput.classList.remove('input_field_error');

}
