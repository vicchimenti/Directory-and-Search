<#ftl encoding="utf-8" output_format="HTML" />
<#--
    This file is responsible for determining the overall structure
    of the search implementations. It contains things such as:

    - The HTML for the overall structure such as the header, footer 
        and main content.
    - The references to the client's header and footer
    - Third party libraries
    - References to javascript templates for sessions and concierge
-->

<#-- Core Funnelback imports -->
<#import "/web/templates/modernui/funnelback_classic.ftl" as s/>
<#import "/web/templates/modernui/funnelback.ftl" as fb />

<#-- 
	Global Stencils imports
	The namespace will be available in all templates which are imported 
-->
<#import "a-z_listing.ftl" as az_listing />
<#import "auto_complete.concierge.ftl" as concierge />
<#import "auto_complete.ftl" as auto_complete />
<#import "base.ftl" as base />
<#import "client_includes.ftl" as client_includes />
<#import "contextual_navigation.ftl" as contextual_navigation />
<#import "counts.ftl" as counts />
<#import "curator.ftl" as curator />
<#import "curator.ftl" as curator />
<#import "extra_search.ftl" as extra_search />
<#import "facets.breadcrumbs.ftl" as facets_breadcrumbs />
<#import "facets.ftl" as facets />
<#import "hero_banner.ftl" as hero_banner />
<#import "no_results.ftl" as no_results />
<#import "pagination.ftl" as pagination />
<#import "query_blending.ftl" as query_blending />
<#import "result_list.ftl" as result_list />
<#import "results.ftl" as results />
<#import "search_tools.ftl" as search_tools />
<#import "spelling_suggestions.ftl" as spelling_suggestions />
<#import "tabs.ftl" as tabs />
<#import "tier_bars.ftl" as tier_bars />

<#import "sessions.search_history.ftl" as search_history />
<#import "sessions.shortlist.ftl" as shortlist />
<#import "sessions.ftl" as sessions />


<#-- Specific result styling imports
	These imports are required for the automatic template selection to work
	The various namespaces (e.g. 'video', 'facebook') need to be on the main scope 
-->
<#import "results.courses.ftl" as courses />
<#import "results.events.ftl" as events />
<#import "results.facebook.ftl" as facebook />
<#import "results.instagram.ftl" as instagram />
<#import "results.people.ftl" as people />
<#import "results.programs.ftl" as programs />
<#import "results.twitter.ftl" as twitter />
<#import "results.video.ftl" as video />

<#-- Used to send absolute URLs for resources -->
<#assign httpHost=httpRequest.getHeader('host')!"">

<!DOCTYPE html>
<html lang="en" class="stencils">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="robots" content="nofollow,noindex">

	<@client_includes.HTMLHeader />
	
	<#if (question.query)!?has_content>
		<title>${question.query!},&nbsp;<@s.cfg>service_name</@s.cfg></title>
	<#else>
		<title><@s.cfg>service_name</@s.cfg></title>
	</#if> 

</head>
<body class="sb-show-main sb-main-padded vsc-initialized">
	<#-- Import the icons so that they are available using the <use> directive. -->
	<div style="display:none">
		<#include "utilities.icons.ftl" />
	</div>

	<a href="#funnelbach-search-body" class="sr-only" title="Skip to search results">
		Skip to search results
	</a>
	
	<#--  
		Uncomment this if you would like to use include urls to inject 
		the client's header.
	-->
	 <@client_includes.ContentHeader />
	

	<div class="stencils__main higher-education">
				
		<@hero_banner.SearchForm />
		<@tabs.Tabs />

		<div class="funnelback-search no-wysiwyg">			
			<div class="funnelback-search__body" id="funnelbach-search-body">
				<h2 class="funnelback-search__title">Results</h2>
				
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

			<div class="funnelback-search__side" id="funnelbach-search-facets">					
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
		</div>
	</div>
	
	<@sessions.SearchHistoryAndShortlist />
    <@client_includes.ContentFooter />
	<#-- Third parties -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>	
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha512-hJSZLjaUow3GsiAkjUBMxN4eaFysMaBvg7j6mkBeo219ZGmSe1eVhKaJJAj5GzGoD0j0Gr2/xNDzjeecdg+OCw==" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js" integrity="sha512-qOBWNAMfkz+vXXgbh0Wz7qYSLZp6c14R0bZeVX2TdQxWpuKr6yHjBIM69fcF8Ve4GUX6B6AKRQJqiiAmwvmUmQ==" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.6/handlebars.min.js" integrity="sha512-zT3zHcFYbQwjHdKjCu6OMmETx8fJA9S7E6W7kBeFxultf75OPTYUJigEKX58qgyQMi1m1EgenfjMXlRZG8BXaw==" crossorigin="anonymous"></script>

	<#-- 
		Libraries required by the design developed by the Stencils cutup team. 
		Avoid changing these if possible.
	-->
	<#-- Plug and play framework -->
	<script type="text/javascript" src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/themes/stencils/js/main.js"></script>

	
	<#-- Stencils specific code -->
	<script src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/js/stencils.js"></script> 
	<script src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/js/handlebars-helpers.js"></script> 
				
	<script>
		window.addEventListener('DOMContentLoaded', function() {			
			setupDeferredImages();
		});
	</script>

	<#-- 
		Enable session functonality which includes cart and click 
		and query history 
	-->
	<#if question.collection.configuration.valueAsBoolean("ui.modern.session")>
		<@sessions.Templates />
		
		<script nomodule src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script>
		
		<#-- We have replaced the products session code with an extended version for Stencils -->
		<script defer src="https://${httpHost!}/s/resources/${question.collection.id}/${question.profile}/js/funnelback.session-cart-0.2.js"></script>
		<@sessions.Configuration />
	</#if>
</body>
</html>
