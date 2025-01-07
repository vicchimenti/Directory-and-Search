
(function($) {
    $('input.on-page-sq-search').autocompletion({
      datasets: {
        organic: {
          collection: 'seattleu~sp-search',
          profile   : '_default',
          program   : 'https://dxp-us-search.funnelback.squiz.cloud/s/suggest.json',
        }
      },
      length: 3
    });
  })(jQuery);