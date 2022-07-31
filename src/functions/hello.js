// eslint-disable-next-line import/prefer-default-export
export const handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({
    message: 'Hello World!',
  }),
});
