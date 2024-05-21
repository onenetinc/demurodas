if (window.location.href.includes('mode=')) {

    document.getElementById('main').style.display = 'none';

    if (document.getElementById('pdfSelector').classList.contains('w-condition-invisible')) {

        document.querySelector('.portrait-pdf-wrapper').style.display = 'none';
        document.querySelector('.landscape-pdf-wrapper').style.display = 'flex';

    } else {

        document.querySelector('.landscape-pdf-wrapper').style.display = 'none';
        document.querySelector('.portrait-pdf-wrapper').style.display = 'flex';

    }

    if (window.location.href.includes('mode=pdf')) {

        document.querySelector('.pdf-page-2-wrapper').style.display = 'flex';

    }

}

const priceHeading = document.getElementById('priceHeading');
const price = document.getElementById('price');
const downloadBtn = document.getElementById('download');

firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        console.log('user is authed')

        getPricing();
        setAuthedTearSheet();
        downloadBtn.style.display = 'flex';

    } else {

        console.log('user is not authed')

        setPubTearSheet();

    }

});


const getPricing = async () => {

    try {

        console.log(`User is authed, sending request for private data`);

        priceHeading.style.display = 'block';
        price.style.display = 'block';

        const sku = document.getElementById('sku').innerText;

        const token = await firebase.auth().currentUser.getIdToken(true);

        const post = await fetch(`${getPrivateWfDataUrl}?token=${token}&sku=${sku}`);

        if (post.status === 200) {

            const text = await post.json();

            const priceEls = document.querySelectorAll("[data-pdf='price']");
            const priceHeadings = document.querySelectorAll("[data-pdf='priceHeading']");
            priceEls.forEach(el => el.innerHTML = text);
            priceEls.forEach(el => el.style.display = 'block');
            priceHeadings.forEach(el => el.style.display = 'block');

        } else {

            throw post.status;

        }

    } catch (err) {

        Sentry.captureException(err);
        price.innerHTML = 'Please contact us for pricing';

    }

}

const scripts = document.querySelectorAll('.w-json');

let imgUrls = [];

scripts.forEach(script => {

    const json = JSON.parse(script.innerText);

    if (json.group === 'product-p') {

        imgUrls.push(json.items[0].url);

    }

});

const downloadText = document.getElementById('downloadText');

const downloadZip = async () => {

    try {

        downloadBtn.removeEventListener('click', downloadZip);

        downloadText.innerText = 'Preparing download...';

        const token = await firebase.auth().currentUser.getIdToken(true);

        let queryString = '';

        imgUrls.forEach(url => {
            queryString += encodeURIComponent(url) + ',';
        });

        const trimmed = queryString.substr(0, queryString.length - 1);

        const url = `${createZipUrl}?urls=${trimmed}&token=${token}`;

        const resp = await fetch(url);

        const blob = await resp.blob();

        const title = document.getElementById('title').innerText;

        saveAs(blob, title + '.zip');

        downloadText.innerHTML = 'Download all images';

        downloadBtn.addEventListener('click', downloadZip);

    } catch (err) {

        Sentry.captureException(err);
        downloadText.innerHTML = 'Download all images';
        downloadBtn.addEventListener('click', downloadZip);

    }

}

downloadBtn.addEventListener('click', downloadZip);

let pubPath = 'pdfs-pub';
let privPath = 'pdfs-priv';

if (window.location.hostname.includes('.webflow.io')) {
    pubPath = 'pdfs-pub-staging';
    privPath = 'pdfs-priv-staging';
};

const setAuthedTearSheet = async () => {

    console.log('Setting private download');

    try {

        const storageRef = firebase.storage().ref();

        const loc = window.location.href.split('/');
        const slug = loc[loc.length - 1];

        const privRef = storageRef.child(`${privPath}/${slug}`);
        const pubRef = storageRef.child(`${pubPath}/${slug}`);

        const privUrl = await privRef.getDownloadURL();
        const pubUrl = await pubRef.getDownloadURL();

        const tearSheet = document.getElementById('tearSheet');
        const options = document.getElementById('downloadOptionsWrapper');

        tearSheet.addEventListener('click', () => {
            if (options.style.display === 'none') {
                options.style.display = 'block';
            } else if (options.style.display === 'block') {
                options.style.display = 'none';
            }
        });

        document.getElementById('withPricing').addEventListener('click', () => window.open(privUrl, '_blank'));
        document.getElementById('withoutPricing').addEventListener('click', () => window.open(pubUrl, '_blank'));

        document.getElementById('dropdownIcon').style.display = 'block';
        document.getElementById('downloadIcon').style.display = 'none';
        document.getElementById('tearSheet').style.display = 'flex';
        options.style.display = 'none';

    } catch (err) {

        console.error(err);

    }

}

const setPubTearSheet = async () => {

    console.log('Setting public download');

    try {

        const storageRef = firebase.storage().ref();

        const loc = window.location.href.split('/');
        const page = loc[loc.length - 1];
        const slug = page.split('?')[0];

        const pubRef = storageRef.child(`${pubPath}/${slug}`);

        const pubUrl = await pubRef.getDownloadURL();

        document.getElementById('tearSheet').addEventListener('click', () => {

            window.open(pubUrl, '_blank')

        });

        document.getElementById('dropdownIcon').style.display = 'none';
        document.getElementById('downloadIcon').style.display = 'block';
        document.getElementById('tearSheet').style.display = 'flex';

    } catch (err) {

        console.error(err);

    }

}

setTimeout(() => {

    const cookiesObj = getCookies();

    const tradeModalWrapper = document.getElementById('tradeModalWrapper');
    
    if (cookiesObj._hideTradeModal) {

        tradeModalWrapper.style.display = 'none';
        
    } else if (window.location.href.includes('mode=')) {

        tradeModalWrapper.style.display = 'none';

    }
    
    const tradeJoinBtn = document.getElementById('tradeJoinBtn');
    const tradeDismissBtn = document.getElementById('tradeDismissBtn');
    
    [tradeJoinBtn, tradeDismissBtn].forEach(btn => {

        if (btn) {

            btn.addEventListener('click', () => {
    
                let expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                expiryDate.toUTCString();
        
                document.cookie = `_hideTradeModal=true; expires=${expiryDate}; path=/`;
        
                tradeModalWrapper.style.display = 'none';
        
            });

        }
    
    });
    
}, 2000);




