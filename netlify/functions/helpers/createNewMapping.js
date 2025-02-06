const createNewMapping = (cmsCollectionItems) => {

    let result = {};

    cmsCollectionItems.forEach(localItem => {
        const item = localItem.fieldData;

        const primaryImgUrl = item.hasOwnProperty('primary-image') ? item['primary-image'].url : null;
        const masonryImgUrl = item.hasOwnProperty('masonry-grid-image') ? item['masonry-grid-image'].url : null;
        const imgUrl = masonryImgUrl ? masonryImgUrl : primaryImgUrl;

        const newBool = item['is-this-a-new-product'] ? item['is-this-a-new-product'] : null;
        const category = item.category2 ? item.category2 : null;
        const subcategory = item.subcategory ? item.subcategory : null;

        result[localItem.id] = {
            imgUrl: imgUrl,
            slug: item.slug,
            updatedOn: localItem['lastUpdated'],
            publishedOn: localItem['lastPublished'],
            new: newBool,
            processed: false,
            category: category,
            subcategory: subcategory,
            aspectRatio: null,
            name: item.name
        };

    });

    return result;

}

module.exports = createNewMapping;