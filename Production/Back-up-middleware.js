// middleware.js (backup pass-through version)
export default async function middleware(request) {
    // This is a pass-through middleware that adds monitoring headers
    // but does not perform any rate limiting
    
    // Simply pass the request through to the handler
    const response = await fetch(request);
    
    // Clone the response to be able to modify headers
    const newResponse = new Response(response.body, response);
    
    // Add headers to indicate rate limiting is disabled
    newResponse.headers.set('X-Rate-Limiting', 'disabled');
    newResponse.headers.set('X-Rate-Limiting-Status', 'pass-through');
    
    // Return the response with added headers
    return newResponse;
  }
  
  // Configure which paths the middleware applies to
  export const config = {
    matcher: [
      // All API endpoints
      '/proxy/:path*',
      '/api/:path*',
      '/dashboard/:path*'
    ]
  };