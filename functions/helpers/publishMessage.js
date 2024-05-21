const { PubSub } = require('@google-cloud/pubsub');

const sendProcessMessage = (topicName, message) => {

    return new Promise(async (resolve) => {

        const pubsub = new PubSub('demurodas');
        const data = JSON.stringify(message);
        const dataBuffer = Buffer.from(data);

        const messageId = await pubsub.topic(topicName).publish(dataBuffer);
        console.log(`Message "${messageId}" published to topic "${topicName}"`);
        
        resolve();

    });

}

module.exports = sendProcessMessage;