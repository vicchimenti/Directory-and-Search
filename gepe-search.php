<?php
$genericFacet = \T4\PHPSearchLibrary\FacetFactory::getInstance('GenericFacet', $documentCollection, $queryHandler);
$filters = $queryHandler->getQueryValuesForPrint();
$categoryFilters = array('coursehours','courseenrollment', 'coursesubject');
$rangeFilters = array();
?>
<section class="su-listing">
    <div id="searchoptionsGeneric" role="search" class="su-listing--form-wrapper bg--dark global-padding--8x" data-t4-ajax-group="courseSearch" >
        <div class="grid-container">
            <h2> Professional Education Course Finder</h2>
        </div>
        <form>
            <div class="cell medium-4 large-4">
                <label for="keywords">Search</label>
                <input type="text" name="keywords" id="keywords" placeholder="Search All Professional Courses &hellip;" value="<?php echo !empty($query['keywords']) ? $query['keywords'] : ''  ?>">
                <!-- htmlspecialchars($query['keywords']) -->
            </div>
          <div class="cell medium-4 large-4">
                <?php
                $element = 'courseenrollment';
                $genericFacet->setMember('element', $element);
                $genericFacet->setMember('type', 'List');
                $genericFacet->setMember('facetSource', 'documents');
                $genericFacet->setMember('multipleValueState', true);
                $genericFacet->setMember('multipleValueSeparator', '|');
                $search = $genericFacet->displayFacet();
                ?>
                <label for="<?php echo $element; ?>" class="label-text">Enrollment Type</label>
                <select id="<?php echo $element; ?>" name="<?php echo $element; ?>" data-cookie="T4_persona">
                    <option value="">All enrollment </option>
                    <?php foreach ($search as $item) : ?>
                        <option value="<?php echo strtolower($item['value']); ?>" <?php echo $item['selected'] ? 'selected' : '' ?>><?php echo $item['label']; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
          	<div class="cell medium-4 large-4">
                <?php
                $element = 'coursesubject';
                $genericFacet->setMember('element', $element);
                $genericFacet->setMember('type', 'List');
                $genericFacet->setMember('facetSource', 'documents');
                $genericFacet->setMember('multipleValueState', true);
                $genericFacet->setMember('multipleValueSeparator', '|');
                $search = $genericFacet->displayFacet();
                ?>
                <label for="<?php echo $element; ?>" class="label-text">Subject</label>
                <select id="<?php echo $element; ?>" name="<?php echo $element; ?>" data-cookie="T4_persona">
                    <option value="">All subjects </option>
                    <?php foreach ($search as $item) : ?>
                        <option value="<?php echo strtolower($item['value']); ?>" <?php echo $item['selected'] ? 'selected' : '' ?>><?php echo $item['label']; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
          
            <div class="cell initial-12">
                <input type="submit" value="Submit" class="button">
            </div>
        </form>
    </div>
        <div class="filter-feedback">
        <div class="grid-container">     
        <span id="starthere"></span>          
            <div id="searchoptions-filters" class="active-filters" role="search" data-t4-ajax-group="gepe-courseSearch" aria-label="Deselect Filters">
            <div id="event-filters" class="active-filters--list" >
                    <span>Active filters:</span>
                    <?php $i = 0; ?>
                    <?php if ($filters !== null) : ?>
                        <?php
                        $tagsHTML = '';
                        foreach ($categoryFilters as $key) {
                            if (isset($filters[$key]) && is_array($filters[$key])) :
                                foreach ($filters[$key] as $value) : 
                                    $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" role="button" tabindex="0" data-t4-value="' . strtolower($value) . '" data-t4-filter="' . $key . '">' . $value . '<span class="remove"><i class="fa fa-times"></i></span></li>'; 
                                endforeach;
                            elseif (isset($filters[$key])) :
                                $value = $filters[$key];
                                $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" role="button" tabindex="0" data-t4-value="' . strtolower($value) . '" data-t4-filter="' . $key . '">' . $value . '<span class="remove"><i class="fa fa-times"></i></span></li>'; 
                            endif;
                        }
                        foreach ($rangeFilters as $key => $max) {
                            if (isset($filters[$key]) && strcmp($filters[$key], $max) !== 0) :
                                $value = $filters[$key]; 
                                $prefix = $value === "0" ? '' : 'Under ';
                                $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" data-max="' . $max . '" role="button" tabindex="0" data-t4-filter="' . $key . '">' . $prefix . '$' . $value . '<span class="remove"><i class="fa fa-times"></i></span></li>';
                            endif;
                        }
                        if (isset($filters['keywords'])) :
                            $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" role="button" tabindex="0" data-t4-filter="keywords">' . $filters['keywords'] . '<span class="remove"><i class="fa fa-times"></i></span></li>'; 
                        endif; 
                        echo $tagsHTML != '' ? '<ul class="no-bullet">' . $tagsHTML . '</ul>' : '' ?>
                    <?php endif; ?>
                </div>
              <?php if ($i > 0) : ?>
              <div class="funderline">
                <a href="index.php" role="button" data-t4-ajax-link="true">
                  Clear Filters
                  <span class="fa fa-times"></span>
                </a>
              </div>
              <?php endif; ?>    
              <div class="search-count"><p>Showing <strong><?php echo count($results); ?> programs</strong> of <?php echo $totalResults; ?></p></div>
            </div>          
        </div>
    </div>
</section>
