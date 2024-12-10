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
    <!-- results.programs::GenericView -->
    <article class="listing-item listing-item--program listing-item--background-grey10 listing-item--color-black" data-fb-result="${(result.indexUrl)!}">   

        <#if (result.listMetadata["programImage"]?first)!?has_content >
            <div class="listing-item__image-wrapper">
                <img class="deferred listing-item__image" alt="Thumbnail for ${result.title!}" src="//${httpRequest.getHeader('host')}/s/resources/${question.collection.id}/${question.profile}/img/pixel.gif" data-deferred-src="${(result.listMetadata["programImage"]?first)!}"> 
            </div>  
        <#elseif ((question.getCurrentProfileConfig().get("stencils.showcase"))!"FALSE")?upper_case == "TRUE">
            <div class="listing-item__image-wrapper">
                <img class="listing-item__image" alt="Thumbnail for ${result.title!}" src="https://picsum.photos/300/300?sig=${(result.title)!''?url}">
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
                        title="${result.title!}" 
                        class="listing-item__title-link"
                    >
                            <@s.Truncate length=90>
                                ${(result.title)!} 
                            </@s.Truncate>
                        </a>    
                    </h3>
                    <#-- Subtitle -->
                    <#if (result.listMetadata["programFaculty"]?first)!?has_content>
                        <div class="listing-item__subtitle">
                            ${(result.listMetadata["programFaculty"]?first)!}     
                        </div>
                    </#if>

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
                      ${(result.listMetadata["c"]?first)!} 
                    </@s.boldicize>
                </div>

                <#-- Metadata should as tags/pills -->        
                <#if (result.listMetadata["credential"])!?has_content
                    || (result.listMetadata["programMode"])!?has_content 
                    || (result.listMetadata["areaOfStudy"])!?has_content 
                    || (result.listMetadata["credential"])!?has_content 
                    || (result.listMetadata["type"])!?has_content>
                    <ul aria-label="Result tags" class="listing-item__tags">
                        <#list (result.listMetadata["credential"])![] as value>
                            <li class="listing-item__tag">${value}</li>
                        </#list>

                        <#list (result.listMetadata["programMode"])![] as value>
                            <li class="listing-item__tag">${value}</li>
                        </#list>
                        <#list (result.listMetadata["areaOfStudy"])![] as value>
                            <li class="listing-item__tag">${value}</li>
                        </#list>
                        <#list (result.listMetadata["type"])![] as value>
                            <li class="listing-item__tag">${value}</li>
                        </#list>
                    </ul>
                </#if>
            </div>          

            <#-- Display the time which this result has last been visited by the user -->
            <@sessions.LastVisitedLink result=result/> 

            <#-- Footer -->                    
            <div class="listing-item__footer">
                <div class="listing-item__footer-block listing-item__footer-block">
                    <#if (result.listMetadata["category"])!?has_content && (result.listMetadata["provider"])!?has_content>
                        <p>
                            ${(result.listMetadata["category"]?first)!} | ${(result.listMetadata["provider"]?first)!}
                        </p>
                    <#elseif (result.listMetadata["category"])!?has_content>
                        <p>
                            ${(result.listMetadata["category"]?first)!}
                        </p>
                    <#elseif (result.listMetadata["provider"])!?has_content>
                        <p>
                            ${(result.listMetadata["provider"]?first)!}
                        </p>
                    </#if>
                </div>
            </div>                                        
        </div>
    </article>    
</#macro>
