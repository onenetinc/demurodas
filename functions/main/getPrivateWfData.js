const verifyToken = require('../helpers/verifyToken');
const getProductPricing = require('../helpers/getProductPricing');


const getPrivateWfData = (admin) => async (req, res) => {

    try {

        const sku = req.query.sku;
        const token = req.query.token;
        const isAuthed = await verifyToken(admin, token);

        if (!sku) {

            console.log(`No item sku was provided - terminating with a 400`);
            throw 401;

        } else if (!isAuthed) {

            console.log(`The token was not valid - terminating with a 401`);
            throw 401;

        }

        const pricing = await getProductPricing({sku: sku});

        if (!pricing) throw 404

        console.log('Terminating with a 200');

        return res.json(pricing);

    } catch (err) {

        console.error(err);
        return res.sendStatus(err);

    }

}

module.exports = getPrivateWfData;