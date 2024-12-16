<#ftl encoding="utf-8" output_format="HTML" />
<#--
        This file is responsible for determining the overall structure
        of the search implementations without the header. Unlike the simple.ftl
        it only provides the search specific elements and does not include things
        like the css or headers and footers. 
        
        - The HTML for the overall structure of the main content.
        - Third party libraries
        - References to javascript templates for sessions and concierge

        The intended purpose of this template is to allow for partial integration
        into an Content Management System (CMS). 
-->

<#-- Core Funnelback imports -->
<#import "/web/templates/modernui/funnelback_classic.ftl" as s/>
<#import "/web/templates/modernui/funnelback.ftl" as fb />

<#-- 
    Global Stencils imports
    The namespace will be available in all templates which are imported 
-->
<#import "base.ftl" as base />
<#import "hero_banner.ftl" as hero_banner />
<#import "search_tools.ftl" as search_tools />
<#import "counts.ftl" as counts />
<#import "query_blending.ftl" as query_blending />
<#import "spelling_suggestions.ftl" as spelling_suggestions />
<#import "curator.ftl" as curator />
<#import "tabs.ftl" as tabs />
<#import "facets.breadcrumbs.ftl" as facets_breadcrumbs />
<#import "facets.ftl" as facets />
<#import "tier_bars.ftl" as tier_bars />
<#import "pagination.ftl" as pagination />
<#import "a-z_listing.ftl" as az_listing />
<#import "contextual_navigation.ftl" as contextual_navigation />
<#import "auto_complete.ftl" as auto_complete />
<#import "auto_complete.concierge.ftl" as concierge />
<#import "curator.ftl" as curator />
<#import "result_list.ftl" as result_list />
<#import "no_results.ftl" as no_results />
<#import "extra_search.ftl" as extra_search />
<#import "results.ftl" as results />
<#import "client_includes.ftl" as client_includes />

<#import "sessions.ftl" as sessions />


<#-- Specific result styling imports
    These imports are required for the automatic template selection to work
    The various namespaces (e.g. 'video', 'facebook') need to be on the main scope 
-->
<#import "results.news.ftl" as news />
<#import "results.law.ftl" as law />
<#import "results.programs.ftl" as programs />
<#import "results.people.ftl" as people />
<#import "results.video.ftl" as video />
<#import "results.facebook.ftl" as facebook />
<#import "results.events.ftl" as events />
<#import "results.twitter.ftl" as twitter />
<#import "results.instagram.ftl" as instagram />

<#-- Used to send absolute URLs for resources -->
<#assign httpHost=httpRequest.getHeader('host')!"">

<#-- Import the icons so that they are available using the <use> directive. -->
<div style="display:none">
    <#include "utilities.icons.ftl" />
</div>
<div class="stencils__main higher-education">
            
    <@hero_banner.SearchForm />
    <@tabs.Tabs />

    
    <div class="grid-container">
        <div class="funnelback-search no-wysiwyg grid-x grid-padding-x">          

            <div class="funnelback-search__side initial-12 medium-4 cell" id="funnelbach-search-facets">
                <section class="promo-section global-padding--3x oho-animate-sequence">
                    <article class="bg--dark bg--red global-padding--3x oho-animate fade-in-up">
                        <div class="grid-container">
                            <div class="grid-x grid-margin-x">
                                <div class="cell auto">
                                    <div class="promo-section--text text-margin-reset">
                                        <h2 class="h4">Lorem Ipsum</h2>
                                        <div class="global-spacing--2x">
                                            <p>Aenean lacinia bibendum nulla sed consectetur.</p>
                                        </div>
                                        <div class="global-spacing--4x">
                                            <a href="#" class="btn">CTA</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>
                <#-- Get facets for the current selected tab -->
                <#assign tabFacets = question.getCurrentProfileConfig().get("stencils.tabs.facets.${(response.customData.stencils.tabs.selected)!}")!>

                <@facets.HasFacets facets=tabFacets>
                    <@facets.Facets 
                        facets=tabFacets 
                        maxCategories=question.getCurrentProfileConfig().get("stencils.faceted_navigation.max_displayed_categories")!
                    />
                </@facets.HasFacets>

                <@curator.HasCuratorOrBestBet position="left">
                    <@curator.Curator position="left" />
                </@curator.HasCuratorOrBestBet>
            </div>
            <div class="funnelback-search__body initial-12 medium-8 clearfix cell" id="funnelbach-search-body">
                <h2 class="funnelback-search__title sr-only">Results</h2>
                
               <@search_tools.SearchTools />
                
                <@query_blending.QueryBlending />
                <@spelling_suggestions.SpellingSuggestions />
                <@facets_breadcrumbs.Breadcrumb />

                <@s.AfterSearchOnly>                        
                    <@curator.HasCuratorOrBestBet position="top">
                        <@curator.Curator position="top" />
                    </@curator.HasCuratorOrBestBet>

                    <@no_results.NoResults />
                    <@result_list.ResultList />

                    <@curator.HasCuratorOrBestBet position="bottom">
                        <@curator.Curator position="bottom" />
                    </@curator.HasCuratorOrBestBet>

                </@s.AfterSearchOnly>

                <@pagination.Pagination />
                <@contextual_navigation.ContextualNavigation />
            </div>
        </div>
    </div>
</div>

<#-- Third parties -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>   
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha512-hJSZLjaUow3GsiAkjUBMxN4eaFysMaBvg7j6mkBeo219ZGmSe1eVhKaJJAj5GzGoD0j0Gr2/xNDzjeecdg+OCw==" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js" integrity="sha512-qOBWNAMfkz+vXXgbh0Wz7qYSLZp6c14R0bZeVX2TdQxWpuKr6yHjBIM69fcF8Ve4GUX6B6AKRQJqiiAmwvmUmQ==" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.6/handlebars.min.js" integrity="sha512-zT3zHcFYbQwjHdKjCu6OMmETx8fJA9S7E6W7kBeFxultf75OPTYUJigEKX58qgyQMi1m1EgenfjMXlRZG8BXaw==" crossorigin="anonymous"></script>

<#-- 
    Libraries required by the design developed by the Stencils cutup team. 
    Avoid changing these if possible.
-->
<#-- Stencil specific code such as the quickview and dropdowns -->
<script type="text/javascript" src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/themes/stencils/js/main.js"></script>


<#-- Stencils specific code -->
<script src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/js/stencils.js"></script> 
<script src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/js/handlebars-helpers.js"></script> 
            

<#-- SU specific code -->
<script>
/***
 * SU Funnelback Partial Script
 * 
 * Handles Tabs, Facets and Tools
 */

// capture dynamic assets and global declarations
let partialUserIpAddress = null;
let partialUserIp = null;




// gather user ip method
async function getUserIP() {
  try {
    let response = await fetch('https://api.ipify.org?format=json');
    let data = await response.json();
    return data.ip;
  } catch (error) {
      console.error('Error fetching IP address:', error);
      return ''; // Default to empty if error occurs
  }
}




// Fetch user's IP address
document.addEventListener('DOMContentLoaded', async function() {
  partialUserIp = await getUserIP();
  partialUserIpAddress = JSON.stringify(partialUserIp);
});




// Funnelback fetch tabs function
async function fetchFunnelbackResults(url, method) {

    let prodTabUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  
    try {
      if (method === 'GET') {
        prodTabUrl += `${url}`;
      }
  
      let options = {
        method,
        headers: {
          'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
          // 'X-Forwarded-For': partialUserIp,
        },
      };
  
      let response = await fetch(prodTabUrl, options);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
  
      let stream = response.body.pipeThrough(new TextDecoderStream());
      let reader = stream.getReader();
      let text = "";
  
      try {
        while (true) {
          const { value, done } = await reader.read();
  
          if (done) {
            break;
          }
          text += value;
        }
  
      } catch (error) {
        console.error("Error reading stream:", error);
      } finally {
        reader.releaseLock();
      }
    
      return text;
  
    } catch (error) {
      console.error(`Error with ${method} request:`, error);
      return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
    }
  }
  




// Funnelback fetch search tools function
async function fetchFunnelbackTools(url, method) {

    let prodToolsUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';
  
    try {
      if (method === 'GET') {
        prodToolsUrl += `${url}`;
      }
  
      let options = {
        method,
        headers: {
          'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
          // 'X-Forwarded-For': partialUserIp,
        },
      };
  
      let response = await fetch(prodToolsUrl, options);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
  
      let stream = response.body.pipeThrough(new TextDecoderStream());
      let reader = stream.getReader();
      let text = "";
  
      try {
        while (true) {
          const { value, done } = await reader.read();
  
          if (done) {
            break;
          }
          text += value;
        }
  
      } catch (error) {
        console.error("Error reading stream:", error);
      } finally {
        reader.releaseLock();
      }
    
      return text;
  
    } catch (error) {
      console.error(`Error with ${method} request:`, error);
      return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
    }
}




// Function to handle anchor clicks
async function handleFacetAnchor(e) {
    e.preventDefault();
  
    const facetAnchor = e.target.closest('.facet-group__list a');
    const facetHref = facetAnchor.getAttribute('href');
    console.log("Relative href:", facetHref);
  
    // Fetch and process data using the relative link
    let getFacetResponse = null;
    if (facetHref) {
      try {
        getFacetResponse = await fetchFunnelbackResults(facetHref, 'GET');
      } catch (error) {
        console.error("Error fetching facet data:", error);
        getFacetResponse = "Error loading facet results.";
      }
    }
  
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">
        ${getFacetResponse || "No facet results found."}
      </div>
    `;
}




// handle tab listeners
async function handleTab(e) {
    e.preventDefault();
  
    const fetchTab = e.target.closest('.tab-list__nav a');
    const tabHref = fetchTab.getAttribute('href');
    console.log("Relative href:", tabHref);
  
    // Fetch and process data using the relative link
    let getTabResponse = null;
    if (tabHref) {
      try {
        getTabResponse = await fetchFunnelbackResults(tabHref, 'GET');
      } catch (error) {
        console.error("Error fetching tab data:", error);
        getTabResponse = "Error loading tab results.";
      }
    }
  
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">
        ${getTabResponse || "No tab results found."}
      </div>
    `;
}




// handle search tool listeners
async function handleSearchTools(e) {
    e.preventDefault();

    const fetchTools = e.target.closest('.search-tools__button-group a');
    const toolHref = fetchTools.getAttribute('href');
    console.log("Relative href:", toolHref);

    // Fetch and process data using the relative link
    let getToolResponse = null;
    if (toolHref) {
        try {
        getToolResponse = await fetchFunnelbackTools(toolHref, 'GET');
        } catch (error) {
        console.error("Error fetching tab data:", error);
        getToolResponse = "Error loading tool results.";
        }
    }

    document.getElementById('results').innerHTML = `
        <div class="funnelback-search-container">
        ${getToolResponse || "No tool results found."}
        </div>
    `;
}




// handle facet cleaners
async function handleClearFacet(e) {
    e.preventDefault();
  
    const fetchClear = e.target.closest('a.facet-group__clear');
    const clearHref = fetchClear.getAttribute('href');
    console.log("Relative href:", clearHref);
  
    // Fetch and process data using the relative link
    let getClearResponse = null;
    if (clearHref) {
      try {
        getClearResponse = await fetchFunnelbackResults(clearHref, 'GET');
      } catch (error) {
        console.error("Error fetching clear data:", error);
        getClearResponse = "Error loading clear results.";
      }
    }
  
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">
        ${getClearResponse || "No clear results found."}
      </div>
    `;
}




class EventManager {
    constructor(rootElement = document) {
        this.rootElement = rootElement;
        this.handlers = [
            { 
                selector: '.facet-group__list a', 
                handler: this.handleFacetAnchor 
            },
            { 
                selector: '.tab-list__nav a', 
                handler: this.handleTab 
            },
            {
                selector: '.search-tools__button-group a',
                handler: this.handleSearchTools
            },
            {
                selector: 'a.facet-group__clear',
                handler: this.handleClearFacet        
            }
        ];
        this.setupListeners();
    }
  
    setupListeners() {
        this.rootElement.addEventListener('click', this.handleClick.bind(this));
    }
  
    handleClick = (e) => {
        const target = e.target;
  
        for (const { selector, handler } of this.handlers) {
            const matchedElement = target.closest(selector);
            if (matchedElement) {
                e.preventDefault(); // Centralize prevention of default behavior
                handler(e, matchedElement);
                break;
            }
        }
    }

    // Bind actual handler methods
    handleFacetAnchor = (e, element) => handleFacetAnchor(e);
    handleTab = (e, element) => handleTab(e);
    handleSearchTools = (e, element) => handleSearchTools(e);
    handleClearFacet = (e, element) => handleClearFacet(e);
}

// Usage remains the same
const eventManager = new EventManager();
</script>