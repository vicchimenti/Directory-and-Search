const { name } = require("tar/lib/types");

(function($) {
    $('#input.on-page-sq-search').autocompletion({
      datasets: {
        organic: {
          name: 'Suggestions',
          collection: 'seattleu~sp-search',
          profile   : '_default',
          program   : 'https://seattleu~sp-search.clients.us.funnelback.com/s/suggest.json',
        }
      },
      length: 3
    });
})(jQuery);


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
