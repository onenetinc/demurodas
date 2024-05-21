const displayNameHeading = document.getElementById('displayName');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const companyInput = document.getElementById('company');
const americasRadio = document.getElementById('americas');
const otherRadio = document.getElementById('other');
const websiteInput = document.getElementById('website');
const resaleInput = document.getElementById('resale');
const submitButton = document.getElementById('submit');

let displayName;
let firstName;
let lastName;
let email;
let company;
let americas;
let website;
let resale;

firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        loadProfile();

    } else {

        window.location.replace('/');

    }

});

const loadProfile = async () => {

    try {

        console.log(`Loading user profile...`);

        const token = await firebase.auth().currentUser.getIdToken(true);
        const user = firebase.auth().currentUser;
        const id = user.uid;

        const post = await fetch(`${getProfileUrl}?token=${token}&id=${id}`);

        if (post.status === 200) {

            const body = await post.json();
            const obj = JSON.parse(body);
            displayName = user.displayName;
            firstName = displayName.split(' ')[0];
            lastName = displayName.split(' ')[1];
            email = user.email;
            company = obj.company;
            americas = obj.americas ? true : false;
            website = obj.website ? obj.website : null;
            resale = obj.resale ? obj.resale : null;

            displayNameHeading.innerText = displayName;
            firstNameInput.value = firstName;
            lastNameInput.value = lastName;
            emailInput.value = email;
            companyInput.value = company;
            if (americas) {
                americasRadio.checked = true;
            } else {
                otherRadio.checked = true;
            }
            if (website) {
                websiteInput.value = website;
            }
            if (resale) {
                resaleInput.value = resale;
            }

            document.getElementById('waitingContainer').style.display = 'none';

        } else {

            throw post.status;

        }

    } catch (err) {

        Sentry.captureException(err);

    }

}

const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const companyError = document.getElementById('companyError');
const websiteError = document.getElementById('websiteError');
const resaleError = document.getElementById('resaleError');
const formError = document.getElementById('globalError');

const saveProfile = () => {

    clearErrors();

    if (validateForm()) {

        postData();

    }

}

submitButton.addEventListener('click', saveProfile);

document.body.addEventListener('keyup', (event) => {

    if (event.keyCode === 13 || event.which === 13) {
        submitButton.click();
    }

});

const validateForm = () => {
    // Define number of errors which will be incremented if necessary
    let errors = 0;

    if (!validateString(firstNameInput.value)) {
        firstNameError.classList.add('input_label_error');
        firstNameError.innerText = 'Please enter a valid first name';
        firstNameInput.classList.add('input_field_error');
        errors++;
    }

    if (!validateString(lastNameInput.value)) {
        lastNameError.classList.add('input_label_error');
        lastNameError.innerText = 'Please enter a valid last name';
        lastNameInput.classList.add('input_field_error');
        errors++;
    }

    if (!validateEmail(emailInput.value)) {
        emailError.classList.add('input_label_error');
        emailError.innerText = 'Please enter a valid email';
        emailInput.classList.add('input_field_error');
        errors++;
    }

    if (!validateString(companyInput.value)) {
        companyError.classList.add('input_label_error');
        companyError.innerText = 'Please enter a valid company name';
        companyInput.classList.add('input_field_error');
        errors++;
    }

    if (!validateWebsite(websiteInput.value)) {
        websiteError.classList.add('input_label_error');
        websiteError.innerText = 'Please enter a valid website';
        websiteInput.classList.add('input_field_error');
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
    firstNameInput.classList.remove('input_field_error');

    lastNameError.classList.remove('input_label_error');
    lastNameError.innerText = 'Last name';
    lastNameInput.classList.remove('input_field_error');

    emailError.classList.remove('input_label_error');
    emailError.innerText = 'Email address';
    emailInput.classList.remove('input_field_error');

    companyError.classList.remove('input_label_error');
    companyError.innerText = 'Company';
    companyInput.classList.remove('input_field_error');

    websiteError.classList.remove('input_label_error');
    websiteError.innerText = 'Website';
    websiteInput.classList.remove('input_field_error');

    formError.style.display = 'none';

}

const formSuccess = document.getElementById('formSuccess');
const urlParams = new URLSearchParams(window.location.search);
const success = urlParams.get('success');


if (success) {

    formSuccess.style.display = 'block';

    setTimeout(() => {

        formSuccess.style.display = 'none';

    }, 10000);

    window.history.pushState({}, document.title, window.location.pathname);

}

const postData = async () => {

    try {

        submitButton.removeEventListener('click', saveProfile);
        submitButton.value = 'Please wait...';

        const token = await firebase.auth().currentUser.getIdToken();

        const body = {
            token: token,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            email: emailInput.value,
            company: companyInput.value,
            americas: americasRadio.checked,
            website: websiteInput.value,
            resale: resaleInput.value,
        };

        const post = await fetch(updateProfileUrl, {

            method: 'POST',
            body: JSON.stringify(body)

        });

        if (post.status === 200) {

            if (emailInput.value !== email) {

                window.location.replace(`/u/sign-in?email=${emailInput.value}`);

            } else {

                window.location.href += '?success=true';

            }

        } else {

            throw post.status;

        }

    } catch (err) {

        submitButton.value = 'Submit';
        submitButton.addEventListener('click', saveProfile);
        Sentry.captureException(err);

        formError.style.display = 'block'

    }

}
