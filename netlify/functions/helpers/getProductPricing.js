const getWfItems = require('./getWfItems');

const getProductPricing = (query) => {

    return new Promise(async(resolve, reject) => {

        try {

            const allItems = await getWfItems();

            let itemKey = Object.keys(query)[0];
            let itemValue = query[Object.keys(query)[0]];

            console.log(`Item key: ${itemKey}, item value: ${itemValue}`);

            let result = null;

            for (i = 0; i < allItems.length; i++) {
                const item = allItems[i];
    
                if (item[itemKey] === itemValue) {
        
                    if (item.hasOwnProperty('price-2') && item['price-2'] !== null) {
                        
                        console.log(`Found a CMS item for "${itemValue}" and got pricing`);
                        result = item['price-2'].trim();
                        break;
    
                    }

                }
    
            }

            if (!result) throw 404
            else resolve(result);

        } catch (err) {

            console.error(err);
            reject(null);

        }

    });

}

module.exports = getProductPricing;