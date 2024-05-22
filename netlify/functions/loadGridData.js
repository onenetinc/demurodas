const loadGridData = (db) => async (req, res) => {

    try {

        const query = req.query;

        const category = query.category ? query.category : null;
        const subcategory = query.subcategory ? query.subcategory : null;

        const doc = await db.collection('cmsMapping').doc('items').get()
        const mappings = Object.entries(doc.data());

        let result = [];

        if (category === 'new') {

            mappings.forEach(([id, item]) => {

                if (item.imgUrl) {

                    const imgUrl = item.imgUrl;
                    const parts = imgUrl.split('.');
                    const extension = parts.pop();
                    const fileName = id + '.' + extension;

                    const newBool = item.new;
                    const processed = item.processed;

                    if (newBool && processed) {

                        result.push({
                            filename: fileName,
                            aspectRatio: item.aspectRatio,
                            slug: item.slug,
                            name: item.name,
                        });

                    }
                }

            });

        } else {


            if (!category && !subcategory) {

                mappings.forEach(([id, item]) => {

                    if (item.imgUrl) {
                        const imgUrl = item.imgUrl;
                        const parts = imgUrl.split('.');
                        const extension = parts.pop();
                        const fileName = id + '.' + extension;
                        const processed = item.processed;

                        if (processed) {

                            result.push({
                                filename: fileName,
                                aspectRatio: item.aspectRatio,
                                slug: item.slug,
                                name: item.name,
                            });

                        }
                    }

                });

            }

            if (category && !subcategory) {

                mappings.forEach(([id, item]) => {

                    if (item.imgUrl) {

                        const imgUrl = item.imgUrl;
                        const parts = imgUrl.split('.');
                        const extension = parts.pop();
                        const fileName = id + '.' + extension;
                        const processed = item.processed;

                        const itemcategory = item.category;

                        if (itemcategory === category && processed) {

                            result.push({
                                filename: fileName,
                                aspectRatio: item.aspectRatio,
                                slug: item.slug,
                                name: item.name,
                            });

                        }

                    }

                });

            }

            if (category && subcategory) {

                mappings.forEach(([id, item]) => {

                    if (item.imgUrl) {

                        const imgUrl = item.imgUrl;
                        const parts = imgUrl.split('.');
                        const extension = parts.pop();
                        const fileName = id + '.' + extension;
                        const processed = item.processed;

                        const itemcategory = item.category;
                        const itemsubcategory = item.subcategory;

                        if (itemcategory === category && itemsubcategory === subcategory && processed) {

                            result.push({
                                filename: fileName,
                                aspectRatio: item.aspectRatio,
                                slug: item.slug,
                                name: item.name,
                            });

                        }

                    }

                });

            }

        }

        const compare = (a, b) => {
            if (a.slug < b.slug)
                return -1;
            if (a.slug > b.slug)
                return 1;
            return 0;
        }

        result.sort(compare);

        return res.json(result);


    } catch (err) {

        console.error(err);
        res.sendStatus(500);

    }

}

module.exports = loadGridData;