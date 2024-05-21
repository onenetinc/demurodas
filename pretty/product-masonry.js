imageData.then((imageData) => imageData.json()).then((imageData) => {

    const targetNode = document.getElementById('pig');

    console.log(imageData);


    if (!imageData.length) {

        targetNode.innerText = 'Sorry, there are no matching items right now.'

    } else {

        const options = {
            spaceBetweenImages: 20,
            urlForSize: function (filename, size) {
                return 'https://storage.googleapis.com/demurodas.appspot.com/' + size + '/' + filename;
            },
            getMinAspectRatio: function (lastWindowWidth) {
                if (lastWindowWidth <= 640)  // Phones
                    return 2;
                else if (lastWindowWidth <= 1280)  // Tablets
                    return 2;
                else if (lastWindowWidth <= 1920)  // Laptops
                    return 3;
                return 4;  // Large desktops
            },
        };

        const pig = new Pig(imageData, options).enable();
        targetNode.innerText = '';

    }

    const config = { attributes: true, childList: true, subtree: true };

    const callback = function (mutationsList, observer) {

        for (const mutation of mutationsList) {

            if (mutation.type == 'childList' && mutation.target.className === 'pig-figure') {

                const element = mutation.addedNodes[0];
                const filePath = element.src;
                const parts = filePath.split('/');
                const fileName = parts.pop();


                imageData.forEach(el => {

                    if (el.filename === fileName) {

                        const slug = el.slug;

                        element.addEventListener('click', function () {
                            window.location.href = '/products/' + slug;
                        });
                        

                        //store product name inside figure with data attr
                        const productName = slug.toUpperCase().replaceAll('-', ' ')
                        mutation.target.dataset.product = el.name
                    }

                });

            }

        }

    };

    const observer = new MutationObserver(callback);

    observer.observe(targetNode, config);

    });

