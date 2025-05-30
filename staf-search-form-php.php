<?php
$genericFacet = \T4\PHPSearchLibrary\FacetFactory::getInstance('GenericFacet', $documentCollection, $queryHandler);
$filters = $queryHandler->getQueryValuesForPrint();
$categoryFilters = array('typeOfStaff', 'staffDepartment', 'schoolCollege');
$dateFilters = array();
$rangeFilters = array();
$i = 0;
?>
<section class="su-listing">
    <div id="searchoptionsGeneric" role="search" class="su-listing--form-wrapper bg--dark global-padding--8x" data-t4-ajax-group="courseSearch">

    <div class="grid-container">
      <h2 class="h3">Explore the Directory</h2>
    </div>

        <form>
            <div class="cell cell medium-4">
                <label for="keywords">Search by Name or Area of Expertise</label>
                <input type="text" name="keywords" id="keywords" placeholder="Names, and Areas of Expertise"
                       value="<?php echo !empty($query['keywords']) ? $query['keywords']: ''  ?>">
            </div>
            <div class="cell medium-4">
                <?php
                $element = 'staffDepartment';
                $genericFacet->setMember('element', $element);
                $genericFacet->setMember('type', 'List');
                $genericFacet->setMember('facetSource', 'documents');
                $genericFacet->setMember('sortingState', true);
                $genericFacet->setMember('multipleValueState', true);
                $genericFacet->setMember('multipleValueSeparator', '|');
                $search = $genericFacet->displayFacet();
                ?>
                <?php if (!empty($search)) : ?>
                    <label for="<?php echo $element; ?>" class="label-text">Search by Department</label>
                    <select id="<?php echo $element; ?>" name="<?php echo $element; ?>" data-cookie="T4_persona">
                        <option value="">All Departments</option>
                        <?php foreach ($search as $item) : ?>
                            <option value="<?php echo strtolower($item['value']) ?>" <?php echo $item['selected'] ? 'selected' : '' ?>><?php echo $item['value']; ?></option>
                        <?php endforeach; ?>
                    </select>
                <?php endif; ?>
            </div>
            <div class="cell medium-4">
                <?php
                $element = 'schoolCollege';
                $genericFacet->setMember('element', $element);
                $genericFacet->setMember('type', 'List');
                $genericFacet->setMember('facetSource', 'documents');
                $genericFacet->setMember('sortingState', true);
                $genericFacet->setMember('multipleValueState', true);
                $genericFacet->setMember('multipleValueSeparator', '|');
                $search = $genericFacet->displayFacet();
                ?>
                <?php if (!empty($search)) : ?>
                    <label for="<?php echo $element; ?>" class="label-text">Filter by School or College</label>
                    <select id="<?php echo $element; ?>" name="<?php echo $element; ?>" data-cookie="">
                        <option value="">All Schools & Colleges</option>
                        <?php foreach ($search as $item) : ?>
                            <option value="<?php echo strtolower($item['value']) ?>" <?php echo $item['selected'] ? 'selected' : '' ?>><?php echo $item['value']; ?></option>
                        <?php endforeach; ?>
                    </select>
                <?php endif; ?>
            </div>
            <div class="cell initial-12">
                <input type="submit" value="Submit" class="button small primary expand">
            </div>
        </form>
    </div>
    <div class="filter-feedback">
        <div class="grid-container">
            <span id="starthere"></span>
                <div id="searchoptions-filters" class="active-filters" role="search" data-t4-ajax-group="courseSearch" aria-label="Deselect Filters">
                    <div id="event-filters" class="active-filters--list" >
                      
                        <span><?php if ($queryHandler->doQuerysExist()): ?>Active filters:<?php endif; ?></span>
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
                            foreach ($dateFilters as $key) {
                                if (isset($filters[$key])) :
                                    $value = $filters[$key]; 
                                    $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" role="button" tabindex="0" data-t4-filter="' . $key . '">' . date('m/d/Y', strtotime($value)) . '<span class="remove"><i class="fa fa-times"></i></span></li>'; 
                                endif;
                            }
                            foreach ($rangeFilters as $key => $max) {
                                if (isset($filters[$key]) && $filters[$key] !== $max) :
                                    $value = $filters[$key]; 
                                    $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" role="button" tabindex="0" data-t4-filter="' . $key . '">$' . $value . '<span class="remove"><i class="fa fa-times"></i></span></li>'; 
                                endif;
                            }
                            if (isset($filters['keywords'])) :
                                $tagsHTML .= '<li class="filter-' . $i++ . ' small primary" role="button" tabindex="0" data-t4-filter="keywords">' . $filters['keywords'] . '<span class="remove"><i class="fa fa-times"></i></span></li>'; 
                            endif; 
                            echo $tagsHTML != '' ? '<ul class="no-bullet">' . $tagsHTML . '</ul>' : '';
                            ?>
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
                </div>
        </div>
    </div>
</section>
