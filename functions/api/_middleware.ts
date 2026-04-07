export const onRequest: PagesFunction = async (context) => {
    if (context.request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    const response = await context.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *');
    response.headers.set('X-Frame-Options', 'ALLOWALL');

    return response;
};
