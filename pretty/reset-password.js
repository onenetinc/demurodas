firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        window.location.replace('/');

    } else {

        document.getElementById('waitingContainer').style.display = 'none';

    }

});

const emailError = document.getElementById('emailError');
const email = document.getElementById('email');
const submitButton = document.getElementById('submit');
const formError = document.getElementById('globalError');
const formSuccess = document.getElementById('formSuccess');

const resetPassword = () => {

    clearErrors();

    if (validateForm()) {

        postResetPasswordData();

    }

}

submitButton.addEventListener('click', resetPassword);

document.body.addEventListener('keyup', (event) => {

    if (event.keyCode === 13 || event.which === 13) {

        submitButton.click();

    }

});


const clearErrors = () => {

    emailError.classList.remove('input_label_error');
    emailError.innerText = 'Enter email address';
    email.classList.remove('input_field_error');

    formError.style.display = 'none';
    formSuccess.style.display = 'none';

}

const validateForm = () => {

    if (!validateEmail(email.value)) {

        emailError.classList.add('input_label_error');
        emailError.innerText = 'Please enter a valid email';
        email.classList.add('input_field_error');
        return false;

    }

    console.log('Validation passed');
    return true;

}

const postResetPasswordData = async () => {

    try {

        submitButton.removeEventListener('click', resetPassword);
        submitButton.value = 'Please wait...';

        const post = await fetch(resetPasswordUrl, {

            method: 'POST',
            body: JSON.stringify({ email: email.value })

        });

        if (post.status === 200) {

            formSuccess.style.display = 'block';
            emailError.innerText = 'Enter email address';
            submitButton.addEventListener('click', resetPassword);
            submitButton.value = 'Submit';

            setTimeout(() => {

                formSuccess.style.display = 'none';
                
            }, 10000);

        } else {

            throw post.status;

        }


    } catch (err) {

        Sentry.captureException(err);
        formError.style.display = 'block';
        emailError.innerText = 'Enter email address';
        submitButton.addEventListener('click', resetPassword);
        submitButton.value = 'Submit';

    }

}