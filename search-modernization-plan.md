# Seattle University Search System Modernization Plan

## Architecture Vision

This plan outlines the approach for modernizing the Seattle University search system with separate frontend and backend components.

### Architecture Components

1. **Backend API** (Existing, on Vercel)
   - Continues handling proxy requests to Funnelback
   - Maintains Redis caching for API responses
   - Provides endpoints for search, suggestions, people, and programs

2. **Frontend API** (New, also on Vercel)
   - Will be built and deployed on Vercel
   - Will use Redis caching with similar structure to backend
   - Will connect to the backend API for data
   - Will be integrated via script tag in pageLayout

3. **Integration Strategy**
   - Simple script tag in the T4 pageLayout
   - Configuration object for customization
   - Support for both global header search and dedicated search page

### Technical Implementation

#### 1. Frontend API on Vercel

```
frontend-search-api/
├── pages/
│   ├── api/
│   │   ├── search.js          # Server-side API for rendered search results
│   │   ├── suggestions.js     # Server-side API for rendered suggestions
│   │   └── enhance.js         # API for client-side enhancements
│   └── _app.js                # Main Next.js app
├── components/
│   ├── SearchInput.js         # Search input with suggestions
│   ├── ResultsList.js         # Search results display
│   └── ...                    # Other components
├── lib/
│   ├── cache.js               # Redis caching implementation
│   ├── api-client.js          # Client for backend API
│   └── utils.js               # Utility functions
├── public/
│   └── search-bundle.js       # Client-side bundle for CMS integration
└── next.config.js             # Next.js configuration
```

#### 2. Redis Caching for Frontend

The frontend API will use Redis caching with similar structure to the backend:

```javascript
// lib/cache.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData(key, ttl = 3600) {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('Redis cache error:', error);
    return null;
  }
}

export async function setCachedData(key, data, ttl = 3600) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
    return true;
  } catch (error) {
    console.error('Redis cache set error:', error);
    return false;
  }
}
```

#### 3. CMS Integration

```html
<!-- In your T4 pageLayout -->
<script>
  window.seattleUConfig = {
    search: {
      apiBaseUrl: 'https://frontend-search-api.vercel.app',
      backendUrl: 'https://funnelback-proxy-dev.vercel.app/proxy',
      collection: 'seattleu~sp-search',
      profile: '_default'
    }
  };
</script>
<script src="https://frontend-search-api.vercel.app/search-bundle.js" defer></script>
```

## Development Roadmap

### Phase 1: Frontend API Development

1. **Setup Next.js project on Vercel**
   - Initialize with TypeScript for better type safety
   - Set up Redis connection
   - Configure environment variables

2. **Create API endpoints**
   - Server-side rendered search results
   - Server-side cached suggestions
   - Client-side enhancement API

3. **Build client-side bundle**
   - Create search-bundle.js for CMS integration
   - Ensure it works with minimal configuration

### Phase 2: Backend Integration

1. **Update backend for frontend compatibility**
   - Add necessary CORS settings
   - Ensure proper error handling
   - Add any new endpoints needed

2. **Synchronize caching strategies**
   - Use consistent TTL values
   - Implement similar cache key generation

### Phase 3: CMS Integration and Testing

1. **Create T4 integration**
   - Add config and script tag to pageLayout
   - Test in development environment

2. **Comprehensive testing**
   - Test header search functionality
   - Test dedicated search page
   - Test caching behavior
   - Test analytics tracking

3. **Performance optimization**
   - Monitor and optimize load times
   - Adjust caching parameters as needed

### Phase 4: Rollout and Monitoring

1. **Staged rollout**
   - Deploy to limited pages first
   - Monitor performance and errors
   - Gather feedback

2. **Full deployment**
   - Roll out to all pages
   - Monitor in production

## Benefits of This Approach

1. **Clean Architecture**: Complete separation between frontend and backend
2. **Consistent Caching**: Redis used for both components
3. **Scalability**: Both APIs on Vercel can scale independently
4. **Performance**: Server-side rendering with client-side enhancements
5. **Maintainability**: Modern code organization with clear responsibilities
6. **Compatibility**: Minimal changes to your CMS

## Key Features

### 1. Enhanced User Experience

- Fast initial load with server-rendered results
- Instant autocomplete suggestions
- Faceted filtering without page reloads
- Improved analytics for better search refinement

### 2. Technical Improvements

- Separate backend and frontend concerns
- Consistent Redis caching approach
- Easy deployment and scaling on Vercel
- Modern JavaScript architecture

### 3. Maintainability

- Clear separation of frontend and backend code
- Consistent coding patterns
- Easier debugging and monitoring
- Better performance tracking
