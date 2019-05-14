export * from './test-service';
import express from 'express';

const app = express();

app.get('/', (_req, res) => {
    res.status(200).send('OK');
});

app.listen(5000);

export const Func = (test: express.Request) => {
    return test.param('test');
};
