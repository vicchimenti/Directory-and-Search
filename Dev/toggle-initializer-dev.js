$(document).ready(function() {
  // Observer for dynamically added tab elements
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        const $tabs = $('.tabs.tabs--center').not('[data-toggle-initialized]');
        if ($tabs.length) {
          $tabs.attr('data-toggle-initialized', 'true');
          
          // Add the toggle button with exact HTML structure from production
          if ($tabs.find('.tab-group_toggle').length === 0) {
            $tabs.prepend(`
              <button type="button" class="tab-group_toggle" aria-expanded="true">
                <svg class="tab-group_icon tab-group_icon--closed">
                  <use href="#add"></use>
                </svg>
                <svg class="tab-group_icon tab-group_icon--open">
                  <use href="#subtract"></use>
                </svg>
                <span class="tab-group_text tab-group_text--show">Show Filters</span>
                <span class="tab-group_text tab-group_text--hide">Hide Filters</span>
                <span class="sr-only">Toggle filters visibility</span>
              </button>
            `);
          }
        }
      }
    });
  });
  
  observer.observe(document.getElementById('results'), { 
    childList: true, 
    subtree: true 
  });
  
  // Check for existing tabs too
  const $existingTabs = $('.tabs.tabs--center').not('[data-toggle-initialized]');
  if ($existingTabs.length) {
    $existingTabs.attr('data-toggle-initialized', 'true');
    
    // Add the toggle button with exact HTML structure from production
    if ($existingTabs.find('.tab-group_toggle').length === 0) {
      $existingTabs.prepend(`
        <button type="button" class="tab-group_toggle" aria-expanded="true">
          <svg class="tab-group_icon tab-group_icon--closed">
            <use href="#add"></use>
          </svg>
          <svg class="tab-group_icon tab-group_icon--open">
            <use href="#subtract"></use>
          </svg>
          <span class="tab-group_text tab-group_text--show">Show Filters</span>
          <span class="tab-group_text tab-group_text--hide">Hide Filters</span>
          <span class="sr-only">Toggle filters visibility</span>
        </button>
      `);
    }
  }
});