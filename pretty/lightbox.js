// Define text mappings

const textMapping = {

    veneers: 'Wood is a natural material, and no two specimens are exactly alike. Variations in color, markings and graining are intrinsic to this material and is to be expected. Finish samples are only presented as representative of color or graining and not as exact matches – a degree of variation is normal and to be expected. Photographs of finishes are subject to the limitations of photography and may vary from physical samples and final product.',
    metals: 'Our metals are formulated and then hand-cast and finished in our factory.  Environmental changes during formulation/casting and the hand finishing process can result in minor natural pitting and slight variations between metal finishes.  In addition, the sheen and texture of metal changes depending on the application - for instance, rounded surfaces tend to display a higher degree of sheen than flat surfaces using the same finish.  Finish samples are only presented as representative of color or texture and not as exact matches – a degree of variation is normal and to be expected.  Photographs of finishes are subject to the limitations of photography and may vary from physical samples and final product.',
    stones: 'Stone is a natural material, and no two specimens are exactly alike.  Variations in color, inclusions, and markings are intrinsic to stone and are to be expected. Finish samples are only presented as representative of color or graining and not as exact matches – a degree of variation is normal and to be expected.  Photographs of finishes are subject to the limitations of photography and may vary from physical samples and final product.',
    specialty: 'Our Carta finish is a natural material made of organic, hand-pounded bark.  Due to the hand-made nature of the product, each piece is unique and variation is to be expected between different samples.  We use Dutch Gold for our gold leaf finish, and ___ for our silver leaf finish.  Our Copper Leaf finish is ___.  Photographs of finishes are subject to the limitations of photography and may vary from physical samples and final product.'

}

// Get all lightbox elements on page load and map urls to item types

let mapping = {};

const scripts = document.querySelectorAll('.w-json');

scripts.forEach(el => {

    const data = JSON.parse(el.innerHTML);
    const group = data.group;
    const imgUrl = data.items[0].url;

    mapping[imgUrl] = group;

});

// Create disclaimer elements

let parentEl;

let disclaimerTextDiv;

let disclaimerText;

const setLightbox = () => {

    console.log('here');

    parentEl = document.getElementsByClassName('w-lightbox-content')[0];

    disclaimerTextDiv = document.createElement('div');
    disclaimerTextDiv.id = 'disclaimerTextDiv';
    disclaimerTextDiv.classList.add('disclaimer-text-div');
    parentEl.appendChild(disclaimerTextDiv);

    disclaimerText = document.createElement('p');
    disclaimerText.id = 'disclaimerText';
    disclaimerText.classList.add('disclaimer-text');

    disclaimerTextDiv.appendChild(disclaimerText);
    disclaimerText.innerText = 'Bla bla bla';

}



// Listen for changes to active lightbox element

const targetNode = document.querySelector('body');

const conf = { attributes: true, childList: true, subtree: true };

const callback = function (mutationsList, observer) {

    for (const mutation of mutationsList) {

        if (mutation.type == 'attributes') {

            if (mutation.target.className === 'w-lightbox-item w-lightbox-active') {

                const imgSrc = mutation.target.children[0].children[0].currentSrc;

                if (!parentEl) setLightbox();

                const type = mapping[imgSrc];

                const disclaimer = type ? textMapping[type] : '';

                const text = disclaimer ? disclaimer : '';

                disclaimerText.innerText = text;

            }

        }

    }

};

const observer = new MutationObserver(callback);

observer.observe(targetNode, conf);



