export const handler = async (event, context) => {

  console.log("endpoint hit!")

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, World",
    }),
  };
};