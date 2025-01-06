<#ftl encoding="utf-8" output_format="HTML" />

<#-- 
    Contains the default presentation logic for a 
    document which is not configured with its own 
    markup. 
-->

<#-- 
    Macro decides how each result should be presented. 

    @param result An individual result fron the data model
    @param view An uppercase string which represents how
        the result should be displayed. Defaults to LIST.
-->
<#macro Result result view="LIST">
    <#switch view?upper_case>
        <#case "CARD">
            <@CardView result=result />
            <#break>
        <#case "LIST">
            <@ListView result=result />
            <#break>
        <#default>
            <@ListView result=result />
    </#switch>
</#macro>

<#--
    Stardard view of a result which is to be displayed in the 
    main section of the search engine result page (SERP)
    @param result An individual result fron the data model
-->
<#macro ListView result>
    <@GenericView result=result />
</#macro>

<#--
    Card view of a result which is to be displayed in the 
    main section of the search engine result page (SERP)
    @param result An individual result fron the data model
-->
<#macro CardView result>
    <@GenericView result=result />
</#macro>

<#--
    A generic view used to drive both the the list and card view
    @param result An individual result fron the data model
-->
<#macro GenericView result>
    <!-- results::GenericView -->
    <article class="listing-item listing-item--generic listing-item--background-grey10 listing-item--color-black dataListing lawData" data-fb-result="${(result.indexUrl)!}">
        <#--  <#if (result.listMetadata["image"]?first)!?has_content>
            <div class="listing-item__image-wrapper">
                <img class="deferred listing-item__image" alt="Thumbnail for ${result.title!}" src="${result.listMetadata["image"]?first}" data-deferred-src="${result.listMetadata["image"]?first}"> 
            </div>  
        </#if>  -->
        <div class="listing-item__content">
            <#-- Title -->
            <#if (result.title)!?has_content>
                <div class="listing-item__header">
                    <h3 class="listing-item__title h4 funderline">
                        <a 
                        href="${result.clickTrackingUrl!}" 
                        data-live-url="${result.liveUrl}" 
                        title="${result.title!}" 
                        class="listing-item__title-link"
                        target="_blank"
                    >
                        <#if (result.listMetadata["lawTitle"])!?has_content>
                            <@s.Truncate length=90>
                                ${(result.listMetadata["lawTitle"]?first)!} 
                            </@s.Truncate>
                        <#elseif (result.listMetadata["t"])!?has_content>
                            <@s.Truncate length=90>
                                ${(result.listMetadata["t"]?first)!} 
                            </@s.Truncate>
                        <#else>   
                            <@s.Truncate length=90>
                                ${(result.title)!}
                            </@s.Truncate>
                        </#if>
                        </a>    
                    </h3>  
                </div>
            </#if>
            
            
            <#-- Body -->
            <div class="listing-item__body">
                <#-- Summary -->
                <div class="listing-item__summary">
                     <#if (result.listMetadata["c"])!?has_content>
                        <@s.Truncate length=150><@s.boldicize>
                           ${result.listMetadata["c"]?first}
                        </@s.boldicize></@s.Truncate>
                    </#if>    
                </div>
            </div>          

            <#-- Display the time which this result has last been visited by the user -->
            <@sessions.LastVisitedLink result=result/>


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
</#macro>
