# Comprehensive Funnelback Search Launch Plan

## Pre-Launch Tasks (Complete Any Time Before Thursday)

### HTML Search Form Update

- [x] Update `autocomplete-input.html` to reposition the label element

```html
<form id="concierge-search-form" 
      class="autocomplete-concierge__form" 
      method="GET" 
      action="">

    <div class="search-config" hidden>
        <input type="hidden" name="collection" value="seattleu~sp-search">
        <input type="hidden" name="profile" value="_default">
        <input type="hidden" name="f.Tabs|programMain" value="program-main">
        <input type="hidden" name="f.Tabs|seattleu~ds-staff" value="Faculty & Staff">
    </div>
    
    <!-- Label now positioned directly before the input -->
    <label for="autocomplete-concierge-inputField" 
            aria-live="polite" 
            id="autocomplete-concierge-label" 
            class="sr-only" 
            hidden>
        Search Seattle University
    </label>

    <input type="text" 
            id="autocomplete-concierge-inputField"
            name="query"
            class="on-page-sq-search"
            autocomplete="off"
            spellcheck="false"
            autofocus
            data-autocomplete
            data-collection="seattleu~sp-search"
            data-profile="_default"
            data-max-results="10"
            data-min-length="3"
            data-results-container="results">
    
    <!-- Rest of the form remains unchanged -->
</form>
```

### CSS Integration Verification

- [x] Check that all autocomplete styles are already included in funnelback.css
- [x] Verify the styles work correctly with search components in staging

## Thursday Morning Launch (6 AM)

### 1. Back Up Existing Google Search (5:30 AM)

- [x] Create archive folder for existing Google search components
- [ ] Move current Google search code to archive folder

### 2. Update Page Layouts

Header File Update (pageLayout-su-web-2023-6907517-header.php)

- [ ] Add Funnelback CSS link to the Stylesheets section:

```html
 <!-- Stylesheets -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,500;0,600;0,700;1,500;1,800&amp;family=Oswald:wght@300;700&amp;family=Roboto+Slab:wght@200;300&amp;display=swap" />
<t4 type="media" id="6907520" formatter="cssver/*" />
<!-- app.css -->
<t4 type="media" id="8739839" formatter="cssver/*" />
<!-- theme.min.css -->
<t4 type="media" id="6907522" formatter="cssver/*" />
<!-- all.css -->
<t4 type="media" id="7022512" formatter="cssver/*" />
<!-- t4-extras.css -->
<t4 type="media" id="8953952" formatter="cssver/*" />
<!-- funnelback.css -->
 ```

#### Footer File Update (pageLayout-su-web-2023-6907517-footer.php)

- [ ] Replace jQuery source
- [ ] Add additional JavaScript libraries
- [ ] Add Funnelback partial scripts
- [ ] Add Funnelback JavaScript modules
- [ ] Update navigation tag for end of body scripts

```php
        </div>
        <!-- .page -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>   
        <!-- jquery.min.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha512-hJSZLjaUow3GsiAkjUBMxN4eaFysMaBvg7j6mkBeo219ZGmSe1eVhKaJJAj5GzGoD0j0Gr2/xNDzjeecdg+OCw==" crossorigin="anonymous"></script>
        <!-- popper.min.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js" integrity="sha512-qOBWNAMfkz+vXXgbh0Wz7qYSLZp6c14R0bZeVX2TdQxWpuKr6yHjBIM69fcF8Ve4GUX6B6AKRQJqiiAmwvmUmQ==" crossorigin="anonymous"></script>
        <!-- typehead.min.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.6/handlebars.min.js" integrity="sha512-zT3zHcFYbQwjHdKjCu6OMmETx8fJA9S7E6W7kBeFxultf75OPTYUJigEKX58qgyQMi1m1EgenfjMXlRZG8BXaw==" crossorigin="anonymous"></script>
        <!-- handlebars.min.js -->
        <script nomodule src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script>
        <!-- es6-promise.auto.min.js -->
        <!-- Partial Scripts -->
        <script src="https://dxp-us-search.funnelback.squiz.cloud/s/resources/seattleu~sp-search/_default/js/stencils.js"></script>
        <script src="https://dxp-us-search.funnelback.squiz.cloud/s/resources/seattleu~sp-search/_default/js/handlebars-helpers.js"></script>
        <!-- End Partial Scripts -->
        <script src="<t4 type='media' id='8723392' formatter='path/*' />" defer></script>
        <!-- flats.min.js -->
        <script src="<t4 type='media' id='6907524' formatter='path/*' />" defer></script>
        <!-- modernizr.js -->
        <script src="<t4 type='media' id='8718323' formatter='path/*' />" defer></script>
        <!-- app.min.js -->
        <script src="<t4 type='media' id='6907526' formatter='path/*' />" defer></script>
        <!-- touchevents.js -->
        <script src="<t4 type='media' id='6930621' formatter='path/*' />" defer></script>
        <!-- emergency-alert.js -->
        <script src="<t4 type='media' id='7022505' formatter='path/*' />" defer></script>
        <!-- t4-extras.js -->
        <script src="<t4 type='media' id='9055999' formatter='path/*' />" type="module" defer></script>
        <!-- results-search-manager.js -->
        <script src="<t4 type='media' id='9017309' formatter='path/*' />" type="module" defer></script>
        <!-- dynamic-results-manager.js -->
        <script src="<t4 type='media' id='9056000' formatter='path/*' />" type="module" defer></script>
        <!-- header-search-manager.js -->
        <script src="<t4 type='media' id='9063951' formatter='path/*' />" type="module" defer></script>
        <!-- global-collapse-manager.js -->
        <script src="<t4 type='media' id='9155586' formatter='path/*' />" type="module" defer></script>
        <!-- autocomplete-search-manager.js -->
        <t4 type="navigation" name="Return Gallery JS" id="956" />
        <t4 type="navigation" name="Return Event Promo JS" id="965" />
        <t4 type="navigation" name="Contact Listing JS" id="1029" />
        <t4 type="navigation" name="Return Scripts for End of Body - Search" id="1090" />
        <t4 type="navigation" name="V10 - Custom Scripts" id="1015" />
        <t4 type="navigation" name="V10 Top Content Custom JS" id="1017" />
    </body>
</html>
```

### 3. Content Migration (5:40-5:55 AM)

 Move code from Dev to Production site:

- [ ] Funnelback Search > Site Assets > Common Header > Code Head → Site Assets > Code - Head
- [ ] Funnelback Search > Site Assets > Common Header > Code Body → Site Assets > Code - Body Start
- [ ] Funnelback Search > Site Assets > Common Header > Code Body End → Site Assets > Code - Body End

### 4. Update JavaScript References (5:55 AM)

 Find and replace all instances of "search-test" with "search" in:

- [x] dynamic-results-manager.js (Line 87)
- [x] header-search-manager.js (Line 214)
- [x] results-search-manager.js (Line 41)

#### Ready to Push

- [ ] dynamic-results-manager.js
- [ ] header-search-manager.js
- [ ] results-search-manager.js

### 5. Publish All Changes (6:00 AM)

- [ ] Publish updated page layouts
- [ ] Publish updated JavaScript files
- [ ] Publish migrated content assets

## Post-Launch Verification (6:05-6:30 AM)

### Functionality Testing

- [ ] Verify search input works
- [ ] Test autocomplete suggestions
- [ ] Perform test searches
- [ ] Check search results display
- [ ] Test facets and filters
- [ ] Verify pagination works
- [ ] Test sorting and filtering options

### Browser Compatibility

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge

### Device Testing

- [ ] Test on desktop
- [ ] Test on mobile devices
- [ ] Test on tablets

### Accessibility Testing

- [ ] Verify keyboard navigation works
- [ ] Check screen reader compatibility
- [ ] Test color contrast compliance

## Rollback Plan (If Needed)

### Criteria for Rollback

- Critical functionality not working
- Broken page layout
- JavaScript errors preventing site usage

### Rollback Steps

- [ ] Restore original page layouts
- [ ] Restore Google search components
- [ ] Revert JavaScript changes
- [ ] Notify stakeholders of rollback

## Common Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Search doesn't load | JS errors | Check browser console |
| No autocomplete | JS/CSS conflict | Verify all libraries loaded |
| Results not styled | Missing CSS | Check funnelback.css is loaded |
| Results don't display | API error | Check network requests |

## Contact Information

- Search Team Lead: Gaurav Mandan
- DevOps: Victor Chimenti
- Funnelback Contact: Ashton Martin
