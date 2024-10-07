<?php
$errorAC = [];
try {
    /* Version 2.1.1 */
    $config = [];
    $config['source']               = '<t4 type="content" name="JSON File" output="normal" formatter="path/*" />';
    $config['library']              = '<t4 type="content" name="Search Library" output="normal" formatter="path/*" />';
    $config['max-results']          = '<t4 type="content" name="Max Results per Page" output="normal" />';
   $config['course_compare']       = '<t4 type="content" name="Course Compare Link" output="linkurl" modifiers="nav_sections" />';
/*    $config['autocomplete']         = str_replace(rtrim($_SERVER['DOCUMENT_ROOT'], '/'), '', __DIR__) .'/autocomplete.php';
    $config['groupBy']              = 'courseName|courseDepartments';
    */
  
    $faculty_staff_home = '<t4 type="navigation" name="Faculty and Staff Bio Link to Home" id="995" />';
  
    mb_http_output('utf-8');
    mb_internal_encoding('utf-8');

    if ($config['course_compare'] != '') {
        $configUrlCC = $_SERVER['DOCUMENT_ROOT']  . $config['course_compare'];
        @include_once($configUrlCC . '/config.php');
    }

    if (!empty($config['option'])) {
        $variables = explode("\n", $config['option']);

        $new_variables = array();
        //Check variables
        foreach ($variables as $variable) {
            //Check my pattern variable = value
            $check = preg_match('/(.+)=(.+)$/iUm', $variable, $output_array);
            //Remove " and ' and taking off first and final spaces.
            if (isset($output_array[1], $output_array[2])) {
                $key = trim(str_replace(array('"', '\''), '', $output_array[1]));
                $value = str_replace(array('"', '\''), '', trim($output_array[2]));
                //Check if there are not set other variables that are setting in different way in this script
                if (!empty($key) && !empty($value)) {
                    $new_variables[$key] = $value;
                }
            }
        }
        if (!isset($config['options'])) {
            $config['options'] = array();
        }
        foreach ($new_variables as $key => $value) {
            if (!isset($config['options'][$key])) {
                $config['options'][$key] = null;
            }
            $config['options'][$key] = $value;
        }
    }

    if (preg_match("/t4_([0-9]{16,20}+)\.php/Ui", $_SERVER['REQUEST_URI'], $output_array)) {
        throw new Exception("Sorry, Course Search is not available in preview.", 1);
    }
    // Configuration Options
    $stopWords = array('/\band\b/is', '/\bof\b/is', '/\bin\b/is', '/\bor\b/is', '/\bwith\b/is', '/\bthe\b/is', '/\bat\b/is');

    require_once((strpos($config['library'], '.phar') !== false ? 'phar://' : '') . realpath($_SERVER["DOCUMENT_ROOT"]).$config['library'] . (strpos($config['library'], '.phar') !== false ? '/vendor/autoload.php' : ''));



    $query  = explode('&', $_SERVER['QUERY_STRING']);
    $params = array();

    foreach ($query as $param) {
        // prevent notice on explode() if $param has no '='
        if ($param == '') {
            continue;
        }
        if (strpos($param, '=') === false) {
            $param .= '=';
        }
        list($name, $value) = explode('=', $param, 2);
        $params[urldecode($name)][] = urldecode($value);
    }

    $queryString = preg_replace('/%5B[0-9]+%5D/simU', '', http_build_query($params));

    $queryHandler = \T4\PHPSearchLibrary\QueryHandlerFactory::getInstance('QueryHandler', $queryString);
    $queryHandler->setStopWords($stopWords);
    $queryHandler->setDontRemoveStopwords(array('typeOfStaff', 'staffDepartment', 'schoolCollege'));
    $queryHandler->setDontTokenize(array('typeOfStaff', 'staffDepartment', 'schoolCollege'));
    $queryHandler->setIgnoreQueries(array('addCourse','removeCourse','paginate','page'));
    $queryHandler->addCharactersToGenericRegex(array('-','/','&','.','\'','(',')','_'));
    $queryHandler->stemQuery(array('keywords'));
    $queryHandler->handleQuery();

    // Initialise our search handler and filters
    $search = \T4\PHPSearchLibrary\SearchFactory::getInstance('Search', $config['source']);
    $substringSearch = \T4\PHPSearchLibrary\FilterFactory::getInstance('FilterBySubstring', $search);
    $wordSearch = \T4\PHPSearchLibrary\FilterFactory::getInstance('FilterByWord', $search);
    $letterComparisonSearch = \T4\PHPSearchLibrary\FilterFactory::getInstance('FilterByLetterComparison', $search);
    $costSearch = \T4\PHPSearchLibrary\FilterFactory::getInstance('FilterByRange', $search);
    $exactSearch = \T4\PHPSearchLibrary\FilterFactory::getInstance('FilterByExactMatch', $search);
    $dateSearch = \T4\PHPSearchLibrary\FilterFactory::getInstance('FilterByDate', $search);

    // if ($queryHandler->isQuerySet('keywords')) {
    //     $substringSearch->setMember('element', 'fullName');
    //     $substringSearch->setMember('query', $queryHandler->getQueryValue('keywords'));
    //     $substringSearch->setMember('combinationOption', true);
    //     $substringSearch->runFilter();
    //     $substringSearch->setMember('element', 'positionTitles');
    //     $substringSearch->runFilter();
    //   	$substringSearch->setMember('element', 'schoolCollege');
    //   	$substringSearch->runFilter();
    //     $substringSearch->setMember('element', 'staffDepartment');
    //   	$substringSearch->runFilter();
    //     $substringSearch->setMember('element', 'areasOfExpertise');
    //   	$substringSearch->runFilter();
    //     $search->combineResults();
    // }

    if ($queryHandler->isQuerySet('keywords')) {
        $wordSearch->setMember('element', 'fullName');
        $wordSearch->setMember('query', $queryHandler->getQueryValue('keywords'));
        $wordSearch->setMember('combinationOption', true);
        $wordSearch->runFilter();
        $wordSearch->setMember('element', 'positionTitles');
        $wordSearch->runFilter();
        $search->combineResults();
    }

    if ($queryHandler->isQuerySet('keywords-expertise')) {
        $wordSearch->setMember('element', 'areasOfExpertise');
        $wordSearch->setMember('query', $queryHandler->getQueryValue('keywords-expertise'));
        $wordSearch->setMember('combinationOption', true);
        $wordSearch->runFilter();
        $search->combineResults();
    }

    if ($queryHandler->isQuerySet('typeOfStaff')) {
        $exactSearch->setMember('element', 'typeOfStaff');
        $exactSearch->setMember('query', $queryHandler->getQueryValue('typeOfStaff'));
        $exactSearch->setMember('multipleValueState', true);
        $exactSearch->setMember('multipleValueSeparator', '|');
        $exactSearch->runFilter();
    }

    if ($queryHandler->isQuerySet('staffDepartment')) {
        $exactSearch->setMember('element', 'staffDepartment');
        $exactSearch->setMember('query', $queryHandler->getQueryValue('staffDepartment'));
        $exactSearch->setMember('multipleValueState', true);
        $exactSearch->setMember('multipleValueSeparator', '|');
        $exactSearch->runFilter();
    }

    if ($queryHandler->isQuerySet('schoolCollege')) {
        $exactSearch->setMember('element', 'schoolCollege');
        $exactSearch->setMember('query', $queryHandler->getQueryValue('schoolCollege'));
        $exactSearch->setMember('multipleValueState', true);
        $exactSearch->setMember('multipleValueSeparator', '|');
        $exactSearch->runFilter();
    }

    // Get the intersection of multiple result sets if necessary
    $search->intersectDocumentResults();


    
    if (!empty($config['groupby'])) {
        $groupBy = explode('|', $config['groupby']);
        $documents = [];
        $uniqueValues = [];
        $searchedDocument = [];
        $index = 0;
        foreach ($search->getDocuments() as $documentKey => $document) {
            $uniqueAttribute = $document['courseURL'].$document['courseDepartments'].$document['courseType'].$document['courseSession'];
            if (!in_array($uniqueAttribute, $uniqueValues)) {
                $documents[$index] = $document;
                $uniqueValues[] = $uniqueAttribute;
                if (in_array($documentKey, $search->getDocumentResults())) {
                    $searchedDocument[$index] = $index;
                }
                $index++;
            }
        }
        $documents = SplFixedArray::fromArray($documents);
    } else {
        $documents = $search->getDocuments();
        $searchedDocument = $search->getDocumentResults();
    }


    // Instantiate the DocumentCollection
    $documentCollection = \T4\PHPSearchLibrary\DocumentCollectionFactory::getInstance('DocumentCollection', $documents, $searchedDocument, $queryHandler->doQuerysExist());

    // Instantiate our Processors
    $compoundSearch = \T4\PHPSearchLibrary\ProcessorFactory::getInstance('CompoundSearch', $documentCollection);
    $frequencySearch = \T4\PHPSearchLibrary\ProcessorFactory::getInstance('FrequencySearch', $documentCollection);
    $termOrderSearch = \T4\PHPSearchLibrary\ProcessorFactory::getInstance('TermOrderSearch', $documentCollection);
    $proximitySearch = \T4\PHPSearchLibrary\ProcessorFactory::getInstance('ProximitySearch', $documentCollection);
    $queryVolumeSearch = \T4\PHPSearchLibrary\ProcessorFactory::getInstance('QueryVolumeSearch', $documentCollection);
    $radialSearch = \T4\PHPSearchLibrary\ProcessorFactory::getInstance('RadialPatternSearch', $documentCollection);

    // Run the processor(s) if the 'keywords' parameter has been set
    if ($queryHandler->isQuerySet('keywords')) {

        // Finds the frequency of the search term in the JSON elements
        $frequencySearch->setMember('query', $queryHandler->getQueryValue('keywords'));
        $frequencySearch->setMember('boost', 6);      
        $frequencySearch->setMember('element', 'fullName');
        $frequencySearch->runProcessor();
        $frequencySearch->setMember('boost', 2);
        $frequencySearch->setMember('element', 'positionTitles');
        $frequencySearch->runProcessor();
      	$frequencySearch->setMember('boost', 1);
        $frequencySearch->setMember('element', 'areasOfExpertise');
        $frequencySearch->runProcessor();
      
      	// Calculates how much of the JSON element is occupied by the search term(s)
        $queryVolumeSearch->setMember('element', 'fullName');
        $queryVolumeSearch->setMember('query', $queryHandler->getQueryValue('keywords'));
        $queryVolumeSearch->setMember('boost', 3);
        $queryVolumeSearch->runProcessor();
      
      	$radialSearch->setMember('element', 'staffDepartment');
        $radialSearch->setMember('multipleValueState', true);
        $radialSearch->setMember('multipleValueSeparator', '|');
        $radialSearch->setMember('boost', 0.5);
        $radialSearch->runProcessor();

        $radialSearch->setMember('element', 'schoolCollege');
        $radialSearch->setMember('multipleValueState', true);
        $radialSearch->setMember('multipleValueSeparator', '|');
        $radialSearch->setMember('boost', 0.5);
        $radialSearch->runProcessor();

        $documentCollection->combineRankedResults();

        $documentCollection->sort('rank', SORT_DESC, 'lastName', SORT_ASC);
    } else {
        $documentCollection->sort('lastName', SORT_ASC);
    }

    // Initialise the Pagination
    $paginate = 0;
    if ((int) $config['max-results'] > 0 || ($queryHandler->isQuerySet('paginate'))) {
        $paginate = (int) ($queryHandler->isQuerySet('paginate') ? (isset($queryHandler->getQueryValue('paginate')[0]) ? $queryHandler->getQueryValue('paginate')[0] : $queryHandler->getQueryValue('paginate')) : $config['max-results']);
        if ($paginate > 0) {
            // Initialise the Pagination
            $pagination = \T4\PHPSearchLibrary\PaginationFactory::getInstance(
                'Pagination',
                $documentCollection,
                $queryHandler,
                $paginate
            );
        
            $pagination->setMember('ulClass', 'pagination');
            $pagination->setMember('currentPage', str_replace('/index.php', '/', $_SERVER['SCRIPT_NAME']));
            $pagination->setMember('currentPageClass', 'current');
            $pagination->setMember('ellipsisClass', 'unavailable');
            $pagination->setMember('ellipsisGap', 8);
            $pagination->setMember('previousLinkText', '<span class="far fa-angle-left"></span> Previous');
            $pagination->setMember('nextLinkText', 'Next <span class="far fa-angle-right"></span>');
            $pagination->setMember('firstLinkText', '<span class="far fa-angle-double-left"></span> First');
            $pagination->setMember('lastLinkText', 'Last <span class="far fa-angle-double-right"></span>');
        }
    }

    $query          = $queryHandler->getQueryValuesForPrint();
    $results        = $queryHandler->doQuerysExist() ? $documentCollection->returnArrayResults() : array();
    if (isset($pagination) && $paginate < $documentCollection->getTotalNumberOfDocumentsInCollection()) {
        $page               = $pagination->getPage('current');
        $paginationArray    = $pagination->displayNavigation(false, true);
        $paginateDropdown   = [$config['max-results'],5,10,20,30,0];
    } elseif ($queryHandler->isQuerySet('paginate')) {
        $page = 1;
        $paginateDropdown   = [$config['max-results'],5,10,20,30,0];
    } else {
        $page = 1;
        $paginateDropdown   = [];
    }
    $paginateDropdown = array_unique(array_filter($paginateDropdown));
    sort($paginateDropdown);
    $current = $page['text'] > 0 ? $page['text'] : 1;
    $totalResults = $documentCollection->getNumberOfDocumentResults() > 0  ? $documentCollection->getNumberOfDocumentResults() : $documentCollection->getTotalNumberOfDocumentsInCollection();
    $resultTo = $paginate *$current;
    if ($resultTo > $totalResults) {
        $resultTo = $totalResults;
    }
    $resultFrom = ($paginate*($current-1)+1);
} catch (\UnderflowException $e) {
    $errorAC[] = $e->getMessage();
} catch (\RuntimeException $e) {
    $errorAC[] = $e->getMessage();
} catch (\InvalidArgumentException $e) {
    $errorAC[] = $e->getMessage();
} catch (\LengthException $e) {
    $errorAC[] = $e->getMessage();
} catch (\Exception $e) {
    $errorAC[] = $e->getMessage();
}
?>
