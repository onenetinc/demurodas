firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        window.location.replace('/');

    } else {

        document.getElementById('waitingContainer').style.display = 'none';

    }

});

const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password1 = document.getElementById('password1');
const password2 = document.getElementById('password2');
const website = document.getElementById('website');
const company = document.getElementById('company');
const americas = document.getElementById('americas');
const other = document.getElementById('other');
const resale = document.getElementById('resale');

const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const password1Error = document.getElementById('password1Error');
const password2Error = document.getElementById('password2Error');
const companyError = document.getElementById('companyError');
const websiteError = document.getElementById('websiteError');

const formError = document.getElementById('globalError');

const submitButton = document.getElementById('submit');

americas.checked = true;
formError.classList.add('global_error');

const userSignUp = () => {

    clearErrors();

    if (validateForm()) {

        postData();

    }

}

submitButton.addEventListener('click', userSignUp);

document.body.addEventListener('keyup', (event) => {

    if (event.keyCode === 13 || event.which === 13) {

        submitButton.click();

    }

});

const validateForm = () => {

    let errors = 0;

    if (!validateString(firstName.value)) {
        firstNameError.classList.add('input_label_error');
        firstNameError.innerText = 'Please enter a valid first name';
        firstName.classList.add('input_field_error');
        errors++;
    }

    if (!validateString(lastName.value)) {
        lastNameError.classList.add('input_label_error');
        lastNameError.innerText = 'Please enter a valid last name';
        lastName.classList.add('input_field_error');
        errors++;
    }

    if (!validateEmail(email.value)) {
        emailError.classList.add('input_label_error');
        emailError.innerText = 'Please enter a valid email';
        email.classList.add('input_field_error');
        errors++;
    }

    if (!validateString(company.value)) {
        companyError.classList.add('input_label_error');
        companyError.innerText = 'Please enter a valid company name';
        company.classList.add('input_field_error');
        errors++;
    }

    if (!validateWebsite(website.value)) {
        websiteError.classList.add('input_label_error');
        websiteError.innerText = 'Please enter a valid website';
        website.classList.add('input_field_error');
        errors++;
    }

    if (password1.value.length < 6) {
        password1Error.classList.add('input_label_error');
        password1Error.innerText = 'Password must have 6 characters';
        password1.classList.add('input_field_error');
    }

    if (password1.value !==password2.value) {
        password2Error.classList.add('input_label_error');
        password2Error.innerText = 'Passwords do not match';
        password2.classList.add('input_field_error');
        errors++;
    }

    if (errors === 0) { // No errors were found, return true
        console.log('Validation passed');
        return true;

    } else {

        return false;

    }

}

const clearErrors = () => {

    firstNameError.classList.remove('input_label_error');
    firstNameError.innerText = 'First name';
    firstName.classList.remove('input_field_error');

    lastNameError.classList.remove('input_label_error');
    lastNameError.innerText = 'Last name';
    lastName.classList.remove('input_field_error');

    emailError.classList.remove('input_label_error');
    emailError.innerText = 'Email address';
    email.classList.remove('input_field_error');

    password1Error.classList.remove('input_label_error');
    password1Error.innerText = 'Password';
    password1.classList.remove('input_field_error');

    password2Error.classList.remove('input_label_error');
    password2Error.innerText = 'Verify password';
    password2.classList.remove('input_field_error');

    companyError.classList.remove('input_label_error');
    companyError.innerText = 'Company';
    company.classList.remove('input_field_error');

    websiteError.classList.remove('input_label_error');
    websiteError.innerText = 'Website';
    website.classList.remove('input_field_error');

    formError.style.display = 'none';

}

const postData = async () => {

    try {

        submitButton.removeEventListener('click', userSignUp);
        submitButton.value = 'Please wait...';

        const body = {
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            password: password1.value,
            company: company.value,
            americas: americas.checked,
            website: website.value,
            resale: resale.value,
        }

        const post = await fetch(signUpUrl, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (post.status === 201) {

            window.localStorage.setItem('emailForSignIn', email.value);
            window.location.replace('/u/success');

        } else {

            throw post.status;

        }

    } catch (err) {

        submitButton.value = 'Submit';
        submitButton.addEventListener('click', userSignUp);

        if (err === 409) {
            emailError.classList.add('input_label_error');
            emailError.innerText = 'Sorry, this email is taken';
            email.classList.add('input_field_error');

        } else {

            formError.style.display = 'block'
            Sentry.captureException(err);

        }

    }
}
