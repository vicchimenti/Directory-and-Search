const { name } = require("tar/lib/types");

(function($) {
    $('#autocomplete-concierge-inputField').autocompletion({
      program   : 'https://seattleu~sp-search.clients.us.funnelback.com/s/suggest.json',
      alpha: '0.5',
      show: '10',
      sort: '0',
      length: '3',
      datasets: {
        organic: {
          name: 'Suggestions',
          collection: 'seattleu~sp-search',
          profile   : '_default',
          show: 10,
        }
      },
      length: 3
    });
})(jQuery);

// example:
      window.addEventListener('load', function() {
        setupDeferredImages();
        setupFacetLessMoreButtons(6, '.search-facet');

    jQuery3('#query').qc({
        program: 'https://gonzaga-search.clients.us.funnelback.com/s/suggest.json',
        alpha: '0.5',
        show: '10',
        sort: '0',
        length: '3',
        datasets: {
            organic: {
                name: 'Suggestions',
                collection: 'gonzaga-search',
                profile: '_default',
                show: '10',
            },
            people: {
                name: 'Faculty',
                collection: 'gonzaga-people-push',
                profile: 'auto-completion',
                show: '3',
                template: {
                  suggestion: jQuery3('#auto-completion-people').text()
                },
            },
            programs: {
                name: 'Programs',
                collection: 'gonzaga-programs-push',
                profile: 'auto-completion',
                show: '5',
                template: {
                  suggestion: jQuery3('#auto-completion-programs').text()
                },
            },
        }
    });
      });





      <!-- jquery autocompletion script -->
      <script>
          $('#input.on-page-sq-search').autocompletion({
              alpha: '0.5',
              show: '10',
              sort: '0',
              length: '3',
              datasets: {
                  organic: {
                      name: 'Suggestions',
                      collection: 'seattleu~sp-search',
                      profile: '_default',
                      program: 'https://dxp-us-search.funnelback.squiz.cloud/s/suggest.html'
                  }
              }
          });
      </script>



<form action="https://dxp-us-admin.funnelback.squiz.cloud/s/search.html" method="GET" class="autocomplete-concierge__form">
<label class="sr-only" aria-live="polite" id="autocomplete-concierge-label">7 results for biology</label>
<input id="autocomplete-concierge-inputField" type="text" autocomplete="off" role="combobox" aria-haspopup="grid" aria-labelledby="autocomplete-concierge-label" aria-autocomplete="list" aria-controls="autocomplete-concierge-grid" placeholder="Start your search here..." class="autocomplete-concierge__input" name="query" value="biology" aria-expanded="false">
<input type="hidden" name="collection" value="seattleu~sp-search"><input type="hidden" name="profile" value="_default"><button type="button" class="autocomplete-concierge__submit hidden"><svg class="autocomplete-concierge__icon" role="img" focusable="false"><title>Clear search</title><use href="#close"></use></svg>Clear</button><button type="submit" class="autocomplete-concierge__submit" aria-labelledby="autocomplete-concierge-submit-label">
  <svg class="autocomplete-concierge__icon" role="img" focusable="false">
  <title id="autocomplete-concierge-submit-label">Submit search</title><use href="#search"></use></svg></button></form>

