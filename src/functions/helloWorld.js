// eslint-disable-next-line import/prefer-default-export
export const handler = async (event) => {
  console.log(typeof event);
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello World! ${JSON.stringify(event, null, 2)}`,
    }),
  };
};
