// const base = 'http://localhost:5001/demurodas/us-central1';
const base = 'https://us-central1-demurodas.cloudfunctions.net';

const signUpUrl = `${base}/signUp`;
const getPrivateWfDataUrl = `${base}/getPrivateWfData`;
const getProfileUrl = `${base}/getProfile`;
const updateProfileUrl = `${base}/updateProfile`;
const resetPasswordUrl = `${base}/resetPassword`;
const createZipUrl = `${base}/createZip`;
const generatePdfUrl = `${base}/generateProductPdf`;

const validateString = (string) => {

    if (string === "" || string.length < 2) {

        console.log(`String failed string vaildation`);
        return false;

    }

    return true;

}

const validateEmail = (email) => {

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const result = re.test(String(email).toLowerCase());

    if (!result) {

        console.log(`Email failed email vaildation`);
        return false;

    }

    return true;

}

const validateWebsite = (website) => {

    if (!website || website.length === 0 || website === '') {

        return true;

    } else if (website.length > 1 && String(website).includes('.')) {

        return true;

    }

    console.log(`Website failed website vaildation`);
    return false;

}

const userLinks = document.querySelectorAll("[data-nav='userLinks']");
const signUp = document.querySelectorAll("[data-nav='signUp']");
const signIn = document.querySelectorAll("[data-nav='signIn']");
const signOut = document.querySelectorAll("[data-nav='signOut']");
const account = document.querySelectorAll("[data-nav='account']");
const divider = document.querySelectorAll("[data-nav='divider']");
const profileSettings = document.querySelectorAll("[data-nav='profileSettings']");
const hideFromMembers = document.querySelectorAll('.hide-from-members');

const currentPath = window.location.pathname;

firebase.auth().onAuthStateChanged((user) => {

    userLinks.forEach(el => {

        if (el) {

            el.style.display = 'none';

        }

    });

    if (user) {

        const pagesToHide = [
            '/u/sign-in',
            'u/sign-up'
        ];

        if (pagesToHide.includes(currentPath)) {

            window.location.replace('/');

        }

        [signUp, divider, signIn].forEach(el => {

            if (el) {

                el.forEach(child => child.style.display = 'none');

            }

        });

        userLinks.forEach(el => {

            if (el) {

                el.style.display = 'flex';

            }

        });

        gtag('config', 'UA-6372121-1', { 'user_id': user.uid });

        signOut.forEach(el => {

            el.addEventListener('click', async () => {

                userLinks.forEach(el => {

                    if (el) {

                        el.style.display = 'none';

                    }

                });

                await firebase.auth().signOut();

                window.location.reload();

            });

        })


    } else {

        console.log(`No user is signed in`);

        const pagesToHide = [
            '/u/profile-settings'
        ];

        if (pagesToHide.includes(currentPath)) {

            window.location.replace('/');

        }

        [account, profileSettings, signOut].forEach(el => {

            if (el) {

                el.forEach(child => child.style.display = 'none');

            }

        });

        userLinks.forEach(el => {

            if (el) { el.style.display = 'flex' }

        });

        hideFromMembers.forEach(el => {

            if (el) { el.style.display = 'block' }

        });

    }

});

const getCookies = () => {

    const cookies = document.cookie.split(';');

    let cookiesObj = {};

    cookies.forEach(cookie => {

        const arr = cookie.split('=');

        cookiesObj[arr[0].trim()] = arr[1];

    });

    return cookiesObj;

}

const cookiesBar = document.getElementById('cookiesBar');

if (cookiesBar) {

    const cookiesAccept = document.getElementById('cookiesAccept');
    const cookiesClose = document.getElementById('cookiesClose');

    const cookiesObj = getCookies();

    if (!cookiesObj._acceptedCookies) {

        cookiesBar.style.display = 'flex';

    }

    cookiesAccept.addEventListener('click', () => {

        let expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 9);
        expiryDate.toUTCString();

        document.cookie = `_acceptedCookies=true; expires=${expiryDate}; path=/`;
        cookiesBar.style.display = 'none';

    });

    cookiesClose.addEventListener('click', () => {

        cookiesBar.style.display = 'none';

    });

}

const waitingCont = document.getElementById('waitingContainer');

setTimeout(() => {

    if (waitingCont) {

        if (waitingCont.style.display !== 'none') {

            window.location.reload();

        }

    }

}, 5000);
