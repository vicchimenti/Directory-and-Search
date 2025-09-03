/**
 * @fileoverview Seattle University Search Results Page with Server-Side Rendering
 * 
 * This page provides instant search results by pre-rendering content on the server
 * before sending it to the client. It integrates seamlessly with the existing 
 * search page structure and JavaScript modules.
 * 
 * The component only handles server-side data fetching and passes the pre-rendered
 * HTML to the existing page structure via dangerouslySetInnerHTML.
 * 
 * @license MIT
 * @author Victor Chimenti
 * @version 1.0.0
 * @lastModified 2025-01-15
 */

import { GetServerSidePropsContext } from 'next';

/**
 * Props interface for the SearchPage component
 */
interface SearchPageProps {
  /** Pre-rendered HTML search results from Funnelback */
  initialResults?: string;
  /** The search query string */
  query: string;
  /** Error message if server-side rendering failed */
  error?: string;
  /** Session ID for analytics and tracking */
  sessionId?: string;
}

/**
 * Search Results Page Component
 * 
 * This component only renders the pre-fetched search results HTML.
 * All existing page structure, CSS, and JavaScript remain unchanged.
 * 
 * @param props - Component props containing search data
 * @returns Pre-rendered search results HTML
 */
export default function SearchPage({
  initialResults,
  query,
  error,
  sessionId
}: SearchPageProps) {

  // If there's an error, return error HTML that matches your existing error format
  if (error) {
    return (
      <div 
        dangerouslySetInnerHTML={{ 
          __html: `<div class="search-error"><h3>Error Loading Results</h3><p>${error}</p></div>` 
        }} 
      />
    );
  }

  // If we have results, return the pre-rendered HTML
  if (initialResults) {
    return <div dangerouslySetInnerHTML={{ __html: initialResults }} />;
  }

  // Fallback loading state
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: `<div class="search-loading"><p>Loading search results...</p></div>` 
      }} 
    />
  );
}

/**
 * Server-Side Props Generation
 * 
 * Pre-fetches search results from the existing Funnelback proxy backend
 * before sending the page to the client.
 * 
 * @param context - Next.js server-side context containing request data
 * @returns Props for the SearchPage component or redirect configuration
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context.query;

  // Show search page with error if no query provided
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return {
      props: {
        query: '',
        error: 'Please enter a search query to see results.',
        initialResults: null
      }
    };
  }

  try {
    // Generate session ID for server-side request
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Use existing backend proxy URL
    const backendUrl = process.env.BACKEND_API_URL || 'https://funnelback-proxy-dev.vercel.app/proxy';

    console.log(`[SSR] Fetching results for query: "${query}"`);

    // Call existing Funnelback search endpoint
    const searchResponse = await fetch(
      `${backendUrl}/funnelback/search?query=${encodeURIComponent(query)}&sessionId=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'SU-Search-SSR/1.0',
          'Accept': 'text/html',
        },
        // Add timeout for server-side rendering
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Search API responded with status: ${searchResponse.status}`);
    }

    // Get the pre-formatted HTML results
    const searchResults = await searchResponse.text();

    console.log(`[SSR] Successfully fetched results for "${query}"`);

    return {
      props: {
        initialResults: searchResults,
        query: query.trim(),
        sessionId
      }
    };

  } catch (error) {
    console.error('[SSR] Error fetching search results:', error);

    // Return error state - existing JavaScript will handle retry/loading
    return {
      props: {
        query: query.trim(),
        error: 'Failed to load initial results.',
        initialResults: null
      }
    };
  }
}