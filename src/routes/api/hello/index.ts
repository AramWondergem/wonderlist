import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json, request }) => {
    console.log('📥 [SERVER] /api/hello endpoint aangeroepen');
    console.log('🧾 [SERVER] Headers:', JSON.stringify([...request.headers]));

    json(200, { message: 'Hallo van de server!' });
};