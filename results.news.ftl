<#ftl encoding="utf-8" output_format="HTML" />

<#-- 
    Macro decides how each result should be presented. 

    @param result An individual result from the data model
    @param view An uppercase string which represents how
        the result should be displayed. Defaults to DETAILED.
-->
<#macro Result result=result view="LIST">
    <#switch view?upper_case>
        <#case "CARD">
            <@CardView result=result />
            <#break>
        <#case "LIST">
            <#-- Determine if results should be hidden or not -->
            <@ListView result=result />
            <#break>
        <#default>
            <@ListView result=result />
    </#switch>
</#macro>

<#--
    Standard view of a result which is to be displayed in the 
    main section of the search engine result page (SERP)
    @param result An individual result from the data model
-->
<#macro ListView result>
    <@GenericView result=result />
</#macro>

<#--
    Card view of a result which is to be displayed in the 
    main section of the search engine result page (SERP)
    @param result An individual result from the data model
-->
<#macro CardView result>
    <@GenericView result=result />
</#macro>

<#--
    A generic view used to drive both the the list and card view
    @param result An individual result from the data model
-->
<#macro GenericView result>
    <!-- results.courses::GenericView -->
    <article class="listing-item listing-item--course listing-item--background-grey10 listing-item--color-black dataListing newsData" data-fb-result="${(result.indexUrl)!}">   

        <#if (result.listMetadata["image"]?first)!?has_content >
            <div class="listing-item__image-wrapper">
                <img class="deferred listing-item__image" alt="Thumbnail for ${result.title!}" src="${(result.listMetadata["image"]?first)!}" data-deferred-src="${(result.listMetadata["image"]?first)!}"> 

                <#--  <img class="deferred listing-item__image" alt="Thumbnail for ${result.title!}" src="//${httpRequest.getHeader('host')}/s/resources/${question.collection.id}/${question.profile}/img/pixel.gif" data-deferred-src="${(result.listMetadata["image"]?first)!}">   -->
            </div>
        </#if> 
        <div class="listing-item__content">
            <#-- Title -->
            <#if (result.title)!?has_content>
                <div class="listing-item__header">
                    <h3 class="listing-item__title h4 funderline">
                        <a 
                        href="${result.clickTrackingUrl!}" 
                        data-live-url="${result.liveUrl}" 
                        title="${(result.listMetadata["author"]?first)!} ${(result.listMetadata["headline"]?first)!}"
                        class="listing-item__title-link"
                        target="_blank"
                        >
                            <@s.Truncate length=90>
                                ${(result.listMetadata["t"]?first)!}
                            </@s.Truncate>
                        </a>
                    </h3>
                

                    <#--  <@QuickView result=result />  -->

                    <#-- Pretty version of the url of the document -->
                    <#--  <cite class="listing-item__subtitle listing-item__subtitle--highlight">
                        <@s.Truncate length=90>
                            ${(result.displayUrl)!}
                        </@s.Truncate>                
                    </cite>  -->
                </div>
            </#if>
            
            
            <#-- Body -->
            <div class="listing-item__body">
                <#-- Summary -->
                <div class="listing-item__summary">
                    <@s.boldicize>
                        <#if (result.listMetadata["c"]?first)!?has_content>
                            ${(result.listMetadata["c"]?first)!}
                        <#else>
                            <#--  ${result.summary!}  -->
                        </#if>
                    </@s.boldicize>
                </div>

                <#-- Metadata should as tags/pills -->        
                <#--  <#if (result.listMetadata["courseDelivery"])!?has_content>
                    <ul aria-label="Result tags" class="listing-item__tags">
                        <#list (result.listMetadata["courseCredit"])![] as value>
                            <li class="listing-item__tag">${value} credit(s)</li>
                        </#list>

                        <#list (result.listMetadata["courseDelivery"])![] as value>
                            <li class="listing-item__tag">${value}</li>
                        </#list>
                    </ul>
                </#if>  -->

                <#-- Call to Action (CTA) -->                        
                <#--  <a href="${result.clickTrackingUrl!}" class="listing-item__action">VIEW PROGRAM DETAILS</a>  -->

                <#--  <span class="enable-cart-on-result listing-item__action" 
                        aria-label="Add result to the shortlist">
                </span>   -->
            </div>          

            <#-- Display the time which this result has last been visited by the user -->
            <@sessions.LastVisitedLink result=result/> 

            <#-- Footer -->
            <#--  <div class="listing-item__footer">
                <div class="listing-item__footer-block listing-item__footer-block">
                    <#if (result.title)!?has_content>
                        <p>
                            ${result.title!}
                        </p>
                    </#if>
                </div>
            </div>                     -->
            <div class="listing-item__footer">
                <div class="listing-item__footer-block listing-item__footer-block">
                    <#if (result.listMetadata["type"])!?has_content && (result.listMetadata["department"])!?has_content>
                        <p>
                            ${(result.listMetadata["type"]?first)!} | ${(result.listMetadata["department"]?first)!}
                        </p>
                    <#elseif (result.listMetadata["type"])!?has_content>
                        <p>
                            ${(result.listMetadata["type"]?first)!}
                        </p>
                    <#elseif (result.title)!?has_content>
                        <p>
                            ${result.title!}
                        </p>
                    </#if>
                </div>
            </div>                                            
        </div>
    </article>    
</#macro>

<#-- Output the cart template -->
<#macro ShortlistTemplate>
    <!-- results.courses::ShortlistTemplate -->    
    <#-- 
        Note: Cart templates as assigned to document types in profile.cfg/collection.cfg using 
        the following configuration:

        stencils.template.shortlist.<collection>=<type> 
        
        e.g. stencils.template.shortlist.higher-education-meta=programs

        For this to function correctly, the ID must be in the following format:
        id="shorlist-template-<type>".

        e.g. id="shorlist-template-programs"
    -->
    <script id="shortlist-template-courses" type="text/x-handlebars-template">
        <article class="listing-item listing-item--program listing-item--background-grey10 listing-item--color-black" data-fb-result="{{indexUrl}}">   

            {{#if metaData.image}} 
                <div class="listing-item__image-wrapper">
                    <img class="listing-item__image" alt="Thumbnail for {{title}}" src="{{metaData.image}}"> 
                </div> 
                <#-- Show a placeholder image for showcase -->     
                <#if ((question.getCurrentProfileConfig().get("stencils.showcase"))!"FALSE")?upper_case == "TRUE">
                    {{else}}
                    <div class="listing-item__image-wrapper">
                        <img class="listing-item__image" alt="Thumbnail for {{title}}" src="https://picsum.photos/300/300?sig={{title}}">
                    </div>
                </#if>
            {{/if}} 
            <div class="listing-item__content">
                <#-- Title -->
                {{#if title}} 
                    <div class="listing-item__header">
                        <a href="{{indexUrl}}" title="{{title}}" class="listing-item__title-link">
                            <h3 class="listing-item__title">
                                {{#truncate 255}}
                                    {{title}}  
                                {{/truncate}}

                                {{#if metaData.courseCode}}  
                                        ({{metaData.courseCode}})
                                {{/if}} 
                            </h3>
                        </a>
                    </div>
                {{/if}} 
                
                
                <#-- Body -->
                <div class="listing-item__body">
                    <#-- Summary -->
                    {{#if metaData.courseDesc}} 
                        <div class="listing-item__summary">
                            {{#truncate 255}}
                                {{metaData.courseDesc}}  
                            {{/truncate}}
                        </div>
                    {{/if}} 

                    <#-- Metadata should as tags/pills -->        
                    <ul aria-label="Result tags" class="listing-item__tags">                                    
                        {{#if metaData.courseCredit}} 
                            {{#list metaData.courseCredit joinWith=", "}}
                                <li class="listing-item__tag">{{ this }} credit(s)</li>
                            {{/list}}
                        {{/if}}
                        
                        {{#if metaData.courseDelivery}} 
                            {{#list metaData.courseDelivery joinWith=", "}}
                                <li class="listing-item__tag">{{ this }}</li>
                            {{/list}}
                        {{/if}}

                    </ul>

                    <p>
                        <span class="fb-cart__remove"></span>
                    </p>

                    <span class="enable-cart-on-result listing-item__action" 
                            aria-label="Add result to the shortlist">
                    </span> 
                </div>          

                <#-- Footer -->                    
                <div class="listing-item__footer">
                    {{#if metaData.courseTerm}} 
                        <div class="listing-item__footer-block listing-item__footer-block">
                            <svg class="svg-icon listing-item__icon">
                                <title>Credits</title>
                                <use href="#time">
                                </use>
                            </svg>
                            {{metaData.courseTerm}}
                        </div>
                    {{/if}} 

                    {{#if metaData.courseCampus}} 
                        <div class="listing-item__footer-block listing-item__footer-block">
                            <svg class="svg-icon listing-item__icon">
                                <title>Campus</title>
                                <use href="#map"></use>
                            </svg>
                            {{metaData.courseCampus}}
                        </div> 
                    {{/if}} 
                </div>                                        
            </div>
        </article>    
    </script>
</#macro>

<#-- 
    Output the template used in the quick view. Quick view
    allows the user view more information about a particular
    document without them having to leave the search results page.
    This aims to minimise the amount of hopping back and forth 
    between systems.
-->
<#macro QuickView result> 
    <!-- results.courses.QuickViewTempplate -->
    <div data-component="modal" class="no-wysiwyg modal-wrapper quickview">
        <div
            role="dialog"
            data-click="modalClose"
            aria-labelledby="${base.getCssID(result.liveUrl)}"
            tabIndex="-1"
            hidden
            class="modal"
        >
            <div data-click="modalPreventClose" class="modal__content">
				<header>
                    <div class="quickview__header-top">
                        <h1 id="${base.getCssID(result.liveUrl)}">
                            ${result.title!}  
                        </h1>					
                        <button
                            type="button"
                            data-click="modalClose"
                            class="modal__close"
                            title="Close modal"
                        >
                            <svg class="svg-icon">
                                <use href="#close" />
                            </svg>
                        </button>
                    </div>

                    <p class="quickview__summary">             
                        <#if (result.listMetadata["courseDesc"]?first)!?has_content>
                            ${(result.listMetadata["courseDesc"]?first)!}
                        <#else>
                            ${result.summary!}
                        </#if>
                    </p>
                </header>
				<section class="quickview__content">
                    <h2>Course details</h2>
                    <dl class="quickview__description-list">
                        <#if (result.listMetadata["courseDelivery"]?first)!?has_content >
                            <dt>Delivery method:</dt>
                            <dd>${(result.listMetadata["courseDelivery"]?first)!} </dd>
                        </#if>
                        <#if ((result.listMetadata["courseCredit"]?first)!"0") != "0">
                            <dt>Credits:</dt>
                            <dd>${(result.listMetadata["courseCredit"]?first)!} credits</dd>
                        </#if>                    
                        <#if (result.listMetadata["courseCampus"]?first)!?has_content>
                            <dt>Campus:</dt>
                            <dd>${(result.listMetadata["courseCampus"]?first)!} </dd>
                        </#if>
                        <#if (result.listMetadata["courseSubject"]?first)!?has_content>
                            <dt>Subject:</dt>
                            <dd>${(result.listMetadata["courseSubject"]?first)!} </dd>
                        </#if>                    
                        <#if (result.listMetadata["courseDepartment"]?first)!?has_content >
                            <dt>Department:</dt>
                            <dd>${(result.listMetadata["courseDepartment"]?first)!} </dd>
                        </#if>                                                  
                        <#if (result.listMetadata["courseCode"]?first)!?has_content >
                            <dt>Code:</dt>
                            <dd>${(result.listMetadata["courseCode"]?first)!} </dd>
                        </#if>
                        <#if (result.listMetadata["courseNumber"]?first)!?has_content >
                            <dt>Number:</dt>
                            <dd>${(result.listMetadata["courseNumber"]?join(", "))!} </dd>
                        </#if>
                        <#if (result.listMetadata["courseTerm"]?first)!?has_content >
                            <dt>Term:</dt>
                            <dd>${(result.listMetadata["courseTerm"]?join(", "))!} </dd>
                        </#if>             
                        <#if (result.listMetadata["courseNotes"]?first)!?has_content >
                            <dt>Notes:</dt>
                            <dd>${(result.listMetadata["courseNotes"]?join(", "))!} </dd>
                        </#if>             
                    </dl>
                    <a href="${result.clickTrackingUrl!}" class="quickview__action" data-target="#${base.getCssID(result.liveUrl)}">
                        Visit course page
                    </a>                    
				</section>
                <footer class="quickview__footer" />
			</div>
        </div>

        <button
            type="button"
            data-click="modalOpen"
            class="modal-wrapper__trigger listing-item__title-link"
        >
            <h3 class="listing-item__title">
                <@s.boldicize>
                    <@s.Truncate length=90>
                        ${(result.title)!} 
                    </@s.Truncate>
                </@s.boldicize>

            <#if (result.listMetadata["courseCode"]?first)!?has_content>
                (${(result.listMetadata["courseCode"]?first)!})
            </#if>

            </h3>
        </button>

    </div>
</#macro>
