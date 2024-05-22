const checkForUpdatedItems = (existingMapping, newMapping) => {

    const newEntries = Object.entries(newMapping);

    if (newEntries.length === 0) {

        return null;

    }

    let updatedItems = [];

    newEntries.forEach(([key, item]) => {

        if (key in existingMapping) {

            if (existingMapping[key].updatedOn !== item.updatedOn) {

                updatedItems.push(key);

            }

        }

    });

    return updatedItems;


}

module.exports = checkForUpdatedItems;