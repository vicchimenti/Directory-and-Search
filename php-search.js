/*
    Note - this has been customised
*/
/* //Start Vars
 * // End Vars */
 "use strict";
 var t4PHPSearch = {};
 
 t4PHPSearch = {
     loadModules: function() {
         if (typeof t4Autocomplete !== 'undefined') {
             var autocomplete = new t4Autocomplete(this);
         }
         if (typeof t4Filter !== 'undefined') {
             var filter = new t4Filter(this);
         }
         if (typeof t4Categories !== 'undefined') {
             var categories = new t4Categories(this);
         }
         if (typeof t4CourseCompare !== 'undefined') {
             //var compare = new t4CourseCompare(this);
         }
         var search = new t4Search(this);
     },
     init: function(attr) {
         if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
             this.loadModules().bind(attr);
         } else {
             if (document.addEventListener){
                 document.addEventListener('DOMContentLoaded', this.loadModules.bind(attr));
             } else if (document.attachEvent){
                 document.attachEvent('DOMContentLoaded', this.loadModules.bind(attr));
             } 
         }
     }
 }
 if (document.querySelectorAll('[data-t4-ajax-group$=Search],[data-t4-ajax-group=courseCompare],[data-t4-compare-button]').length > 0) {
     t4PHPSearch.init();
 }
 var t4Generic = {};
 t4Generic.prototype = {
     events: [],
     ajaxGroupSel: '[data-t4-ajax-group]',
     ignoreParams: ['page','paginate','addCourse','removeCourse'],
     getEvent: function (eventName) {
         if (typeof this.events[eventName] === 'undefined') {
             if (typeof(Event) === 'function') {
                 this.events[eventName] = new Event(eventName, {"bubbles": true, "cancelable": true});
             } else {
                 this.events[eventName] = document.createEvent('Event');
                 this.events[eventName].initEvent(eventName, true, true);
             }
         }
         return this.events[eventName];
     },
     getParent: function (element, parentSelector) {
         var parent = document.querySelectorAll(parentSelector);
 
         var found = -1;
         for (var i = 0; i < parent.length; i++) {
             if (parent[i] !== element && parent[i].contains(element)) {
                 found = i;
             }
         }
         
         if (found == -1) {
             return null;
         } else {
             return parent[found];
         }
     },
     urlParam: function(link, name){
         var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(link);
         if (results == null){
            return null;
         } else {
            return decodeURI(results[1]) || 0;
         }
     },
     hasUrlParams: function(link){
         var pattern = '[\?|&]((?!(' + this.ignoreParams.join('|') + ')).+)=([^&#]*)';
         var results = new RegExp(pattern).exec(link);
         if (results == null){
            return false;
         } else {
            return true;
         }
     },
     runAjax: function (link, groupSel, loadArea, reloadLoadArea, async, disableCache, pushHistory) {

         if (typeof reloadLoadArea === 'undefined') {
             reloadLoadArea = false;
         }
         if (typeof async === 'undefined') {
             async = true;
         }
         
         if (typeof disableCache === 'undefined') {
             disableCache = false;
         }

         if (typeof pushHistory === 'undefined') {
            pushHistory = false;
         }
 
         if (loadArea !== null) {
             var loadAreaID = loadArea.getAttribute('id');
             
            const programListingItems = document.querySelectorAll('.program-listing--item');
            programListingItems.length > 0 ?programListingTrigger() : null
             if (loadAreaID == null) {
                 console.error('T4Search: AJAX Error no id found for ' , loadArea);
                 return false;
             }
             var contents = document.querySelectorAll(groupSel);
             var contentID = [];
 
             var mainType = loadArea.getAttribute('role') === 'search' ? 'search' : '';
             
             for (var i = 0; i < contents.length; ++i) {
                 var cID = contents[i].getAttribute('id');
                 if (cID == null) {
                     console.error('T4Search: AJAX Error no id found for ', contents[i]);
                 } else if (cID !== loadAreaID) {
                     var type = contents[i].getAttribute('role') === 'search' ? 'search' : '';
                     var hidden = contents[i].querySelector(groupSel);
                     var subForm = contents[i].querySelector(groupSel + '[role=search]');
         
                     if (type == 'search') {
                         var names = contents[i].querySelectorAll('[name]');
                         if (names != null && names.length > 0) {
                             var found = false;
                             if (this.hasUrlParams(link)) {
                                 for (var x = 0;  x < names.length; ++x) {
                                     var nameValue = names[x].getAttribute('name');
                                     var isHidden = names[x].getAttribute('type') == 'hidden';
                                     if (this.urlParam(link, nameValue) !== null && !isHidden) {
                                         contentID.push(cID);
                                         found = true;
                                     }
                                 }
                                 if (hidden !== null && found == false) {
                                     var hID = hidden.getAttribute('id');
                                     if (cID == null) {
                                         console.error('AJAX Error no id found for ' + hidden);
                                     } else {
                                         contentID.push(hID);
                                     }
                                 }
                             } else {
                                 contentID.push(cID);
                             }
                         } else {
                             contentID.push(cID);
                         }
                     } else if (hidden === null || subForm !== null){
                         contentID.push(cID);
                     }
                 }
             }
             if (mainType == 'search') {
                 var names = loadArea.querySelectorAll('[name]:not(button):not([type=hidden])');
                 if (names != null && names.length > 0) {
                     reloadLoadArea = false;
                 } else {
                     reloadLoadArea = true;
                 }
             } else if (mainType != 'hidden') {
                 reloadLoadArea = true;
             }
 
             var forceReload = loadArea.getAttribute('data-t4-force-reload');
 
             if (forceReload === "true" ) {
                 reloadLoadArea = true;
             }
 
             if (reloadLoadArea == true) {
                 loadArea.style.opacity = 0.5;
             }
             if (typeof contentID != 'undefined') {
                 for (var i = 0; i < contentID.length; ++i) {
                     var selector = document.getElementById(contentID[i]);
                     if (selector !== null) {
                         selector.style.opacity = 0.5;
                     }
                 }
             }
         }
 
         if (disableCache) {
             link += ((/\?/).test(link) ? "&" : "?") + (new Date()).getTime();
         }
 
         var request = new XMLHttpRequest();
         request.open('GET', link, async);
         request.processData = false;
         request.contentType = false;
         request.crossDomain = true;
         request.withCredentials = true;


         request.onload = function () {
          
             if (request.status >= 200 && request.status < 400) {
                 var data = document.createElement('div');
                 data.setAttribute('id', 't4SearchAjax');
                 data.innerHTML = request.responseText;
                 if (loadArea !== null) {
                     if (reloadLoadArea == true) {
                         if (data.querySelector('#' + loadAreaID) !== null ) {
                             loadArea.innerHTML = data.querySelector('#' + loadAreaID).innerHTML;
                         }
                     }
                     
                     if (typeof contentID != 'undefined') {
                         for (i = 0; i < contentID.length; ++i) {
                             var selector = document.querySelector('#' + contentID[i]);
             
                             if (selector !== null) {
                                 selector.innerHTML = data.querySelector('#' + contentID[i]).innerHTML 
                             }
                         }
                     }
                     
                     document.dispatchEvent(this.getEvent('t4-after-ajax'));
 
                     if (reloadLoadArea == true) {
                         loadArea.style.opacity = 1;
                     }
 
                     if (typeof contentID != 'undefined') {
                         for (i = 0; i < contentID.length; ++i) {
                             var selector = document.querySelector('#' + contentID[i]);
                             if (selector !== null) {
                                 selector.style.opacity = 1;
                             }
                         }
                     }
                 }
                 if (!disableCache && pushHistory) {
                    window.history.pushState( {}, '', link);
                 }
                 var checkScroll = loadArea.hasAttribute('data-t4-scroll');
                 if (checkScroll && window.innerWidth <= 1024) {
                    const element = document.getElementById("starthere");
                    var scrollOffsetElements = document.querySelectorAll('[data-t4-scroll-offset]');
                    for (var i = 0; i < scrollOffsetElements.length; ++i) {
                        this.ScrollToOffset += scrollOffsetElements[i].offsetHeight;
                    }
                    var elementPosition = element.getBoundingClientRect().top;
                    var offsetPosition = elementPosition + window.pageYOffset - this.ScrollToOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                 }
                //  TEST
               	t4_accordionBtnsHandler();

                //  T4 Run compare programs
                 occupiedCheck();
                 updateCheckboxes();
                 programListingTrigger();
                 programListingWrappingTrigger();

             } else {
                 loadArea.style.opacity = 1;
                 console.error('T4Search: AJAX Success with Status' + request.status);
                 return false;
             }
         }.bind(this);
 
         request.onerror = function () {
             console.error('T4Search: AJAX Error with Status' + request.status);
             this.activeRequest = false;
             return false;
         };
 
         request.send();
         
         return true;
     },
     handleForm: function (container, groupSel) {
         var loadArea = this.getParent(container,groupSel);
         if (loadArea == null) {
             console.error('T4Search: An occured error trying to handle form ' + groupSel);
         }
         var form = loadArea.querySelector("form");
         var urlBase = window.location.pathname;
         if (form.getAttribute('action') !== null) {
             urlBase = form.getAttribute('action').replace('index.php','');
         }
         var url = urlBase;
         var params = this.serializeArray(form);
         var query = Object.keys(params).map(function (k) {
             return encodeURIComponent(params[k]['name']) + '=' + encodeURIComponent(params[k]['value'])
         }).join('&')   
         if (query != '') {
             url += '?' + query;
         }
 
 
         if (urlBase == window.location.pathname || document.querySelector(this.ajaxGroupSel + '' + this.resultSel) != null) {
             return this.runAjax(url, groupSel, loadArea);
         } else {
             window.location.href = url;
         }
         
     },
     serializeArray: function (form) {
         var field, l, s = [];
         if (typeof form == 'object' && form.nodeName == "FORM") {
             var len = form.elements.length;
             for (var i = 0; i < len; i++) {
                 field = form.elements[i];
                 if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
                     if (field.type == 'select-multiple') {
                         l = form.elements[i].options.length;
                         for (j = 0; j < l; j++) {
                             if (field.options[j].selected)
                                 s[s.length] = {
                                     name: field.name,
                                     value: field.options[j].value
                                 };
                         }
                     } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
                         s[s.length] = {
                             name: field.name,
                             value: field.value
                         };
                     }
                 }
             }
         }
         return s;
     }
 };
 
 function t4Autocomplete(attrs) {
     this.constructor = function () {
         this.autoCompleteInput = 'input[type=text][data-t4-autocomplete-url]';
         this.autoCompleteResults = '.autocomplete-results';
         this.autoCompleteResultsList = '.change-search-value';
         
         this.ScrollToOffset = 0;
 
         this.keys = {
             Escape: 27,
             LeftArrow: 37,
             UpArrow: 38,
             RightArrow: 39,
             DownArrow: 40,
             Enter: 13
         }
 
         //Change Attribues with User defined info
         for (var key in attrs) {
             if (typeof this[key] !== 'undefined' && this[key] !== null) {
                 this[key] = attrs[key];
             }
         }
 
         this.activeRequest = false;
         this.keyUpTime;
         this.delayTimer;
 
         var autoCompleteInputs = document.querySelectorAll(this.autoCompleteInput);
         if (autoCompleteInputs != null) {
             for (var i = 0; i < autoCompleteInputs.length; ++i) {
                 if (autoCompleteInputs[i].hasAttribute('data-t4-autocomplete-url')) {
                     autoCompleteInputs[i].setAttribute('autocomplete', 'off');
                 }
             }
 
             //If it is not possible to find the main container it will not trigger the JS
             document.addEventListener("click", this.eventList.bind(this), false);
             document.addEventListener("change", this.eventList.bind(this), false);
             document.addEventListener("input", this.eventList.bind(this), false);
             document.addEventListener("keyup", this.eventList.bind(this), false);
             document.addEventListener("keypress", this.eventList.bind(this), false);
         }
     };
     this.eventList = function (event) {
       console.log('1 - ');
       console.log(event);
         var done = false;
         var autoCompleteInputs = document.querySelectorAll(this.autoCompleteInput);
         if (autoCompleteInputs != null) {
             for (var i = 0; i < autoCompleteInputs.length; i++) {
                 
                 var autocompleteContainer, autocompleteContainerList, inputText;
                 if (event.target.hasAttribute('name') && event.target.hasAttribute('data-t4-autocomplete-url')) {
                     autocompleteContainer = document.querySelector(this.autoCompleteResults + '[data-name=' + event.target.name + ']');
                     inputText = event.target;
                 } else {
                     if (event.target.classList.contains(this.autoCompleteResults.replace('.',' ').trim())) {
                         autocompleteContainer = event.target;   
                     } else if (event.target.parentNode !== null && event.target.parentNode.classList.contains(this.autoCompleteResults.replace('.',' ').trim())) {
                         autocompleteContainer = event.target.parentNode;
                     }
                     if (autocompleteContainer !== null) {
                         var comboBox = this.getParent(autocompleteContainer,'[role=combobox]');
                         if (comboBox !== null) {
                             inputText = comboBox.querySelector('input[name=' + autocompleteContainer.getAttribute('data-name') + ']');
                         }
                     }
                     
                 }
                 if (typeof autocompleteContainer === 'undefined') {
                     autocompleteContainer = null;
                 }
                 if (autocompleteContainer !== null) {
                     autocompleteContainerList = autocompleteContainer.querySelectorAll(this.autoCompleteResultsList);
                 } else {
                     autocompleteContainerList = [];
                 }
                 
                 if (typeof inputText === 'undefined') {
                     this.removeAutoCompleteResultsDiv();
                 } else {
                     inputText.setAttribute('autocomplete', 'off');
                 }
 
                 if (event.type === 'click') {
                     //Change value on click
                     for (var x = 0; x < autocompleteContainerList.length; ++x) {
                         if (event.target === autocompleteContainerList[x]) {
                             var autocompleteContainer = event.target.parentNode;
                             if (autocompleteContainer !== null) {
                                 var inputText = this.getParent(autocompleteContainer,'div').querySelector('input[name=' + event.target.parentNode.getAttribute('data-name') + ']');
         
                                 var value = event.target.getAttribute('data-value');
                             
                                 inputText.value = value;
                                 inputText.dispatchEvent(this.getEvent('keyup'));
                                 done = true;
                             }
                         }
                     }
                     //Close the listbox when click elsewhere (except listbox and textbox)
                     if (autocompleteContainer !== null && event.target !== autocompleteContainer && event.target !== inputText) {
                         this.removeAutoCompleteResultsDiv(autocompleteContainer.getAttribute('data-name'));
                     }  
                 }
                 if (event.type === 'keyup') {
                     if (inputText !== null && typeof inputText !== 'undefined') {
                         if (inputText.name !== null) {
                             var autocompleteContainerElse = document.querySelectorAll(this.autoCompleteResults + ':not([data-name=' + inputText.name + '])');
                         }
                     }
                     if (autocompleteContainerElse !== null && typeof autocompleteContainerElse !== 'undefined') {
                         for (var x = 0; x < autocompleteContainerElse.length; ++x) {
                             this.removeAutoCompleteResultsDiv(autocompleteContainerElse[x].getAttribute('data-name'));
                         }
                     }
                     if (event.target === autoCompleteInputs[i]) {
                         if (event.keyCode == this.keys.Escape) {
                             event.target.value = '';
                         }
                         var keys = this.keys;
                         var values = Object.keys(keys).map(function(e) {
                             return keys[e]
                         });
                         if (values.indexOf(event.keyCode) === -1 && event.target === document.activeElement) {
                             done = this.eventAutoComplete(event);
                         }
                         
                     }
                     //Escape = Clears the textbox + If the listbox is displayed, closes it
                     if (event.keyCode == this.keys.Escape) {
                         if (event.target === autocompleteContainer || event.target.parentNode === autocompleteContainer) {
                             inputText.value = '';
                             done = true;
                             this.removeAutoCompleteResultsDiv(inputText.name);
                             inputText.focus();
                         } else if (event.target === autoCompleteInputs[i]) {
                             done = true;
                             this.removeAutoCompleteResultsDiv(autoCompleteInputs[i].name);
                         }
                     }
                     //Listbox - End = Moves focus to the textbox and places the editing cursor at the end of the field.
                     if (event.target.parentNode === autocompleteContainer && event.keyCode == this.keys.DownArrow && event.shiftKey)  {
                         autocompleteContainer.lastChild.focus();
                         done = true;
                     //Textbox - Down Arrow = Moves focus to the first suggested value in the list box
                     }  else if (event.target === autoCompleteInputs[i] && autocompleteContainer !== null && event.keyCode == this.keys.DownArrow && event.target === document.activeElement)  {
                         autocompleteContainer.firstChild.focus();
                         done = true;
                     //Listbox - Down Arrow = Moves focus to the next option + If focus is on the last option, moves focus to the first option
                     } else if((event.target.parentNode === autocompleteContainer) && event.keyCode == this.keys.DownArrow && event.target === document.activeElement) {
                         if (document.activeElement.nextSibling !== null) {
                             document.activeElement.nextSibling.focus();
                             done = true;
                         } else {
                             autocompleteContainer.firstChild.focus();
                             done = true;
                         }
                     }
 
                     //Listbox - Home = Moves focus to the textbox and places the editing cursor at the beginning of the field.
                     if (event.target.parentNode === autocompleteContainer && event.keyCode == this.keys.UpArrow && event.shiftKey)  {
                         autocompleteContainer.firstChild.focus();
                         done = true;
                     //Textbox - Up Arrow: If the listbox is displayed, moves focus to the last suggested value.
                     } else if (event.target === autoCompleteInputs[i] && event.keyCode == this.keys.UpArrow && event.target === document.activeElement)  {
                         autocompleteContainer.lastChild.focus();
                         done = true;
                     //Listbox - Up Arrow: Moves focus to the previous option. + If focus is on the first option, moves focus to the last option.
                     } else if(event.target.parentNode === autocompleteContainer && event.keyCode == this.keys.UpArrow && event.target === document.activeElement) {
                         if (document.activeElement.previousSibling !== null) {
                             document.activeElement.previousSibling.focus();
                             done = true;
                         } else {
                             autocompleteContainer.lastChild.focus();
                             done = true;
                         }
                     }
 
                     if ((event.target === autocompleteContainer || event.target.parentNode === autocompleteContainer) && (event.keyCode == this.keys.LeftArrow || event.keyCode == this.keys.RightArrow)) {
                         inputText.focus();
                         //Listbox Left Arrow = Moves focus to the textbox and moves the editing cursor one character to the left.
                         if (event.keyCode == this.keys.LeftArrow) {
                             inputText.selectionStart = inputText.value.length > 0 ? inputText.value.length  -1 : 0;
                             inputText.selectionEnd = inputText.value.length > 0 ? inputText.value.length  -1 : 0;
                          //Listbox Right Arrow = Moves focus to the textbox and moves the editing cursor one character to the right.
                         } else {
                             inputText.selectionStart = inputText.value.length > 0 ? 1 : 0;
                             inputText.selectionEnd = inputText.value.length > 0 ? 1 : 0;
                         }
                     }
                 }
                 if (event.type === 'keypress') {
                     //Textbox - Enter = Does nothing.
                     if (event.target === autoCompleteInputs[i] && event.keyCode == this.keys.Enter) {
                         done = true;
                     } else {
                         done = false;
                     }
     
                     //Listbox - Enter = Sets the textbox value to the content of the focused option in the listbox. + Closes the listbox. + Sets focus on the textbox.
                     for (var x = 0; x < autocompleteContainerList.length; ++x) {
                         if (event.target === autocompleteContainerList[x] && event.keyCode == this.keys.Enter ) {
                             var link = event.target.querySelector('a');
                             if (link !== null) {
                                 if (link.getAttribute('href') != '') {
                                     window.location.href = link.getAttribute('href');
                                 }
                             } else {
                                 var value = event.target.getAttribute('data-value');
                                 inputText.value = value;
                                 inputText.dispatchEvent(this.getEvent('keyup'));
                                 this.removeAutoCompleteResultsDiv(inputText.name);
                                 done = true;
                             }
                         }
                     }
                     
                     var isPrintableChars = (event.keyCode > 47 && event.keyCode < 58)   || // number keys
                     event.keyCode == 32 || event.keyCode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
                     (event.keyCode > 64 && event.keyCode < 91)   || // letter keys
                     (event.keyCode > 95 && event.keyCode < 112)  || // numpad keys
                     (event.keyCode > 185 && event.keyCode < 193) || // ;=,-./` (in order)
                     (event.keyCode > 218 && event.keyCode < 223);   // [\]' (in order)
                     
                     //Listbox - Printable Characters = Moves focus to the textbox + Types the character in the textbox.
                     if (event.target.parentNode === autocompleteContainer && isPrintableChars && event.target === document.activeElement)  {
                         inputText.focus();
                         inputText.dispatchEvent(this.getEvent('keyup'));
                         done = false;
                     } else if (event.target.parentNode !== autocompleteContainer && isPrintableChars) {
                         this.removeAutoCompleteResultsDiv();
                     }
                 }
                 /*
                 */
             }
 
             
         }
         if (done === true) {
             event.preventDefault(); // Cancel the native event
             event.stopPropagation(); // Don't bubble/capture the event
         }
     };
     this.eventAutoComplete = function (event) {
         if (event.target.hasAttribute('id')) {
             var id = event.target.getAttribute('id');
         } else {
             var id = 'acTextBox' + Math.random();
             event.target.setAttribute('id', id);
         }
         event.target.setAttribute('aria-autocomplete', 'list');
         event.target.setAttribute('aria-controls', 'autocompleteResults');
         event.target.setAttribute('aria-activedescendant', 'autocompleteResults');
 
         var parentDiv = this.getParent(event.target, 'div');
         parentDiv.setAttribute('role', 'combobox');
         parentDiv.setAttribute('aria-haspopup', 'listbox');
         parentDiv.setAttribute('aria-owns', 'autocompleteResults');
         parentDiv.setAttribute('aria-expanded', false);
 
         var inputValue = event.target.value;
         var autocompleteUrl = event.target.getAttribute('data-t4-autocomplete-url');
         var inputName = event.target.name;
 
         //If string is empty remove the results div
         if (inputValue.length == 0) {
             this.removeAutoCompleteResultsDiv(inputName);
             return false;
         }
         if (autocompleteUrl === false) return;
         if (inputName === false) return;
 
         var autocompleteContainer = document.querySelector(this.autoCompleteResults + '[data-name=' + inputName + ']');
         var request = new XMLHttpRequest();
 
         if (autocompleteContainer !== null) {
             autocompleteContainer.innerHTML = '';
             parentDiv.setAttribute('aria-expanded', false);
         }
         
         //Check if URL has queries.
         if(autocompleteUrl.indexOf('?') === -1 ) {
             autocompleteUrl = autocompleteUrl + '?term=' + inputValue;
         } else {
             autocompleteUrl = autocompleteUrl + '&term=' + inputValue;
         }
 
         request.open('GET', autocompleteUrl);
 
         request.onload = function () {
             if (request.status >= 200 && request.status < 400) {
                 try {
                 var autocompleteResults = JSON.parse(request.responseText);
                 } catch (e) {
                     console.error('T4Search: URL Response is not a valid JSON File for element "' + inputName + '"');
                 return false;
                 }
                 var autocompleteContainer = document.querySelector(this.autoCompleteResults + '[data-name=' + inputName + ']');
                 if (autocompleteContainer === null) {
                     var resultDiv = document.createElement('ul');
                     resultDiv.setAttribute('class', this.autoCompleteResults.replace('.',' '));
                     resultDiv.setAttribute('role', 'listbox');
                     resultDiv.setAttribute('aria-labelledby', id);
                     resultDiv.setAttribute('data-name', inputName);
                     this.getParent(event.target, 'div').appendChild(resultDiv);
                     autocompleteContainer = document.querySelector(this.autoCompleteResults + '[data-name=' + inputName + ']');
                 }
                 var html = '';
                 if (autocompleteResults.length > 0) {
                     for (var i = 0; i < autocompleteResults.length; ++i) {
                         if (autocompleteResults[i].value == event.target.value) {
                             
                         }
                         html += '<li id="id' + i+ '" role="option" data-value="' + autocompleteResults[i].value + '" class="search-info change-search-value" data-name="' + event.target.getAttribute('name') + '"  tabindex="-1">' + autocompleteResults[i].label + '</li>';
                     }
                 }
                 
                 autocompleteContainer.innerHTML = html;
                 this.getParent(event.target, 'div').setAttribute('aria-expanded', true);
                 
             } else {
                 console.error('T4Search: AJAX URL returns Status ' + request.status + ' with element "' + inputName + '"');
                 return false;
             }
             this.activeRequest = false;
         }.bind(this);
 
         request.onerror = function () {
             console.error('T4Search: AJAX URL returns Status ' + request.status + ' with element "' + inputName + '"');
             this.activeRequest = false;
             return false;
         };
 
         request.send();
 
         return true;
 
     };
     this.removeAutoCompleteResultsDiv = function (inputName){
         if (typeof inputName === 'undefined' ){
             inputName = '';
         } else {
             inputName = '[data-name=' + inputName + ']';
         }
         var autocompleteContainer = document.querySelector(this.autoCompleteResults + inputName);
         if (autocompleteContainer !== null) {
             this.getParent(autocompleteContainer, 'div').setAttribute('aria-expanded', false);
             autocompleteContainer.parentNode.removeChild(autocompleteContainer);    
         }
     };
     this.constructor(this);
 }
 t4Autocomplete.prototype = Object.create(t4Generic.prototype);
 t4Autocomplete.prototype.constructor = t4Autocomplete;
 function t4Categories(attrs) {
 
     this.constructor = function () {
 
         //Change Attribues with User defined info
         for (var key in attrs) {
             if (typeof this[key] !== 'undefined' && this[key] !== null) {
                 this[key] = attrs[key];
             }
         }
 
         this.ajaxCatLinkSel = '[data-catlink][data-catname]';
         this.ajaxGroupSel = '[data-t4-ajax-group]';
 
         document.addEventListener("t4-after-ajax", this.eventList.bind(this), false);
         window.addEventListener("load", this.eventList.bind(this), false);
         document.addEventListener("click", this.eventList.bind(this), false);
     };
     this.loadCategories = function () {
         var filterElements = document.querySelectorAll(this.ajaxCatLinkSel);
         for (var i = 0; i < filterElements.length; i++) {
             var link = filterElements[i].getAttribute('data-catlink') + '?' + filterElements[i].getAttribute('data-catname') + '=';
             var html = '';
             var text = filterElements[i].innerText;
             if (text != '') {
                 var categories = [];
                 if (filterElements[i].hasAttribute('data-separator')) {
                     categories = text.split(filterElements[i].getAttribute('data-separator'));
                 } else {
                     categories = [text];
                 }
 
                 for (var x = 0; x < categories.length; ++x) {
                     var childSeparator = filterElements[i].getAttribute('data-child-separator');
                     var catName = categories[x];
                     if (typeof childSeparator == 'string') {
                         var childTo = filterElements[i].getAttribute('data-child-to');
                         if (typeof childTo == 'string') {
                             catName = catName.replace(childSeparator, childTo);
                         } else {
                             var levelNames = categories[x].split(filterElements[i].getAttribute('data-child-separator'));
                             catName = levelNames[levelNames.length - 1];
                         }
                     }
                     if (filterElements[i].getAttribute('data-catname') !== '') {
                         html += '<a href="' + link + categories[x] + '" data-t4-ajax-link="true" >' + catName + '</a>';
                     } else {
                         html += catName;
                     }
                     if (filterElements[i].hasAttribute('data-separator') && x < categories.length - 1) {
                         html += filterElements[i].getAttribute('data-separator');
                     }
                 }
                 filterElements[i].innerHTML = html;
             }
         }
     }
     this.eventList = function (event) {
         if (event.type === 'load' || event.type === 't4-after-ajax') {
             this.loadCategories();
         }
         if (event.type === 'click') {
             var filterElements = document.querySelectorAll(this.ajaxCatLinkSel);
             for (var i = 0; i < filterElements.length; ++i) {
                 if (event.target === filterElements[i]) {
                     this.linkCategories(event);
                 }
             }
         }
     };
     this.linkCategories = function (event) {
             var clicked = event.target;
 
             var checksArray = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=radio][name="' + name + '"][data-category="' + category + '"],' + this.ajaxGroupSel + ' form input[type=checkbox][name="' + name + '"][data-t4-value="' + category + '"]');
             for (var i = 0; i < checksArray.length; i++) {
                 checksArray[i].checked = false;
                 checksArray[i].dispatchEvent(this.getEvent('change'));
             }
 
         },
         this.checkLoad = function () {};
     this.constructor(this);
 }
 t4Categories.prototype = Object.create(t4Generic.prototype);
 t4Categories.prototype.constructor = t4Categories;
/*
 function t4CourseCompare(attrs) {
     this.disableSel = '.disabled';
     this.courseCompareSubmitSel = '[type=submit]';
     this.min = 2;
     this.max = 3;
     this.relTop = -60;
 
     this.constructor = function () {
 
         var mainContainer = document.querySelector('[data-compare-min]');
         if (mainContainer !== null) {
             this.min = mainContainer.getAttribute('data-compare-min');
         }
         var mainContainer = document.querySelector('[data-compare-max]');
         if (mainContainer !== null) {
             this.max = mainContainer.getAttribute('data-compare-max');
         }
 
 
         //Change Attribues with User defined info
         for (var key in attrs) {
             if (typeof this[key] !== 'undefined' && this[key] !== null) {
                 this[key] = attrs[key];
             }
         }
 
         this.courseCompareButtonsSel = '[data-t4-compare-button]';
         this.ErrorMessageSel = '[data-t4-compare=error]';
         this.tableSel = '[data-t4-compare=table]';
         this.ajaxGroupSel = '[data-t4-ajax-group=courseCompare]';
         this.ajaxSaveSel = '[data-t4-ajax-save]';
         this.ignoreHeader = '[data-t4-compare-ignore]';
         this.cookieName = 'saved_courses_compare';
         this.buttonSavedCourse = 'saved_courses_compare';
 
 
         window.addEventListener("load", this.eventList.bind(this), false);
         document.addEventListener("t4-after-ajax", this.eventList.bind(this), false);
         window.addEventListener("resize", this.eventList.bind(this), false);
         window.addEventListener("scroll", this.eventList.bind(this), false);
         document.addEventListener("click", this.eventList.bind(this), false);
     };
     this.eventList = function (event) {
         var done = false;
         if (event.type === 'load' || event.type === 't4-after-ajax') {
             this.checkSavedCoursesForm();
             this.StickyLoad();
             this.Sticky();
             this.checkSavedCourse();
             this.checkModal();
         }
 
         if (event.type === 'click') {
            
             var checkedBoxes = document.querySelectorAll(this.ajaxGroupSel + " input[type=checkbox]");
             for (var i = 0; i < checkedBoxes.length; ++i) {
                 if (event.target === checkedBoxes[i]) {
                     this.checkSavedCoursesForm();
                 }
             }
 
             var submit = document.querySelector(this.ajaxGroupSel + " " + this.courseCompareSubmitSel);
 
             if (submit !== null && event.target === submit) {
                 this.handleForm(submit, this.ajaxGroupSel);
             }
 
             var courseCompareButtonsClass = document.querySelectorAll('a' + this.courseCompareButtonsSel + ',' + this.courseCompareButtonsSel + ' a');
 
             for (var i = 0; i < courseCompareButtonsClass.length; ++i) {               
                 if (event.target === courseCompareButtonsClass[i]) {
                     done = this.eventSave(event);
                     done = true;
                 } 
             }
         }
 
         if (event.type === 'resize') {
             this.StickyLoad();
             this.Sticky();
         }
 
         if (event.type === 'scroll') {
             this.Sticky();
         }
 
         if (done === true) {
             event.preventDefault(); // Cancel the native event
             event.stopPropagation(); // Don't bubble/capture the event
         }
     };
     this.eventSave = function (event) {
         var done;
         var link = event.target.getAttribute("href");
         var loadArea = this.getParent(event.target, '[data-t4-ajax-group]');
         done = this.runAjax(link, '[data-t4-ajax-group]', loadArea, false, true, true);
         return done;
     }
     this.checkSavedCoursesForm = function () {
         var checkedBoxes = document.querySelectorAll(this.ajaxGroupSel + " input:checked");
         var uncheckedBoxes = document.querySelectorAll(this.ajaxGroupSel + " input:not(:checked)");
 
         if (document.querySelector(this.ajaxGroupSel) !== null) {
             if (checkedBoxes.length >= this.max) {
                 for (var i = 0; i < uncheckedBoxes.length; ++i) {
                     uncheckedBoxes[i].classList.add(this.disableSel.replace('.', ' ').trim());
                     uncheckedBoxes[i].disabled = true;
                 }
                 if (document.querySelector(this.ajaxGroupSel + " " + this.ErrorMessageSel) !== null) {
                     document.querySelector(this.ajaxGroupSel + " " + this.ErrorMessageSel).style.display = 'block';
                 }
             } else {
                 for (var i = 0; i < uncheckedBoxes.length; ++i) {
                     uncheckedBoxes[i].classList.remove(this.disableSel.replace('.', ' ').trim());
                     uncheckedBoxes[i].disabled = false;
                 }
                 if (document.querySelector(this.ajaxGroupSel + " " + this.ErrorMessageSel) !== null) {
                     document.querySelector(this.ajaxGroupSel + " " + this.ErrorMessageSel).style.display = 'none';
                 }
             }
 
             var submitButton = document.querySelector(this.ajaxGroupSel + " " + this.courseCompareSubmitSel);
             if (submitButton !== null) {
                 if (checkedBoxes.length < this.min) {
                     submitButton.classList.add(this.disableSel.replace('.', ' ').trim());
                     submitButton.disabled = true;
                 } else {
                     submitButton.classList.remove(this.disableSel.replace('.', ' ').trim());
                     submitButton.disabled = false;
                 }
             }
         }
     };
     this.StickyLoad = function () {
         // Get the header of sticky
         this.sticky = 0;
         this.margin = 0;
         this.width = 0;
         if (document.querySelector(this.tableSel) !== null) {
             var table = document.querySelector(this.tableSel);
             var header = document.querySelector(this.tableSel + ' thead');
             table.classList.remove("sticky");
             this.sticky = header.getBoundingClientRect().top + window.pageYOffset;
             var ignoreHeaders = document.querySelectorAll(this.ignoreHeader);
             var ignoreHeadersTotal = 0;
             for (var i = 0; i < ignoreHeaders.length; ++i) {
                 ignoreHeadersTotal += ignoreHeaders[i].getBoundingClientRect().height;
             }
             this.sticky -= ignoreHeadersTotal;
             document.querySelector(this.tableSel + ' thead').style.top = ignoreHeadersTotal + 'px';
 
             this.margin = header.getBoundingClientRect().height;
             this.width = header.getBoundingClientRect().width;
         }
     }
     this.Sticky = function () {
         var table = document.querySelector(this.tableSel);
         var header = document.querySelector(this.tableSel + ' thead');
         var body = document.querySelector(this.tableSel + ' tbody');
         if (header !== null) {
             if (window.pageYOffset > this.sticky) {
                 table.classList.add("sticky");
                 header.style.width = this.width + 'px';
                 body.style.marginTop = this.margin + 'px';
             } else {
                 table.classList.remove("sticky");
                 header.style.width = 'auto';
                 body.style.marginTop = 0;
             }
         }
     }
     this.getCookie = function (cname) {
         var name = cname + "=";
         var decodedCookie = decodeURIComponent(document.cookie);
         var ca = decodedCookie.split(';');
         for (var i = 0; i < ca.length; i++) {
             var c = ca[i];
             while (c.charAt(0) == ' ') {
                 c = c.substring(1);
             }
             if (c.indexOf(name) == 0) {
                 return c.substring(name.length, c.length);
             }
         }
         return "";
     }
     this.checkSavedCourse = function() {
         var courseCompareButtonsClass = document.querySelectorAll('a' + this.courseCompareButtonsSel + '[data-t4-id],' + this.courseCompareButtonsSel + '[data-t4-id] a');
         var savedCookieCourses = this.getCookie(this.cookieName) ? this.getCookie(this.cookieName) : '{}';
         var savedCourses = Object.values(JSON.parse(savedCookieCourses));
             for (var i = 0; i < courseCompareButtonsClass.length; ++i) {
                 var course = parseInt(courseCompareButtonsClass[i].getAttribute('data-t4-id'));
                 if (savedCourses.indexOf(course) > -1) {
                     courseCompareButtonsClass[i].setAttribute('aria-pressed',true);
                     var newHtml = courseCompareButtonsClass[i].getAttribute('data-t4-saved-html');
                     var oldHtml = courseCompareButtonsClass[i].innerHTML;
                     var newHref = courseCompareButtonsClass[i].getAttribute('data-t4-saved-href');
                     var oldHref = courseCompareButtonsClass[i].href;
                     courseCompareButtonsClass[i].innerHTML = newHtml;
                     courseCompareButtonsClass[i].href = newHref;
                     courseCompareButtonsClass[i].setAttribute('data-t4-saved-html', oldHtml);
                     courseCompareButtonsClass[i].setAttribute('data-t4-saved-href', oldHref);
                 } else if (courseCompareButtonsClass[i].getAttribute('aria-pressed') == true) {
                     courseCompareButtonsClass[i].setAttribute('aria-pressed',false);
                     var newHtml = courseCompareButtonsClass[i].getAttribute('data-t4-saved-html');
                     var oldHtml = courseCompareButtonsClass[i].innerHTML;
                     var newHref = courseCompareButtonsClass[i].getAttribute('data-t4-saved-href');
                     var oldHref = courseCompareButtonsClass[i].href;
                     courseCompareButtonsClass[i].innerHTML = newHtml;
                     courseCompareButtonsClass[i].href = newHref;
                     courseCompareButtonsClass[i].setAttribute('data-t4-saved-html', oldHtml);
                     courseCompareButtonsClass[i].setAttribute('data-t4-saved-href', oldHref);
                 }
             }
     }
     this.checkModal = function () {
        var courseCompareModals = document.querySelectorAll('.course-compare-preModal');
        for (var i = 0; i < courseCompareModals.length; ++i) {
            if (courseCompareModals[i].classList.contains('show')) {
                document.body.classList.add('has-modal');
            } else {
                document.body.classList.remove('has-modal');
            }
        }
     }
     this.constructor(this);
 }
 t4CourseCompare.prototype = Object.create(t4Generic.prototype);
 t4CourseCompare.prototype.constructor = t4CourseCompare;
*/
 function t4Filter(attrs) {
 
     this.constructor = function () {
         this.hideClass = 'hide';
 
         //Change Attribues with User defined info
         for (var key in attrs) {
             if (typeof this[key] !== 'undefined' && this[key] !== null) {
                 this[key] = attrs[key];
             }
         }
 
         this.mainFilterSel = '[data-t4-filter]';
         this.ajaxGroupSel = '[data-t4-ajax-group]';
         this.clearFilterSel = '[data-t4-clear]';
         this.resultSel = '[role^=main]';
 
         window.addEventListener("load", this.eventList.bind(this), false);
         document.addEventListener("t4-after-ajax", this.eventList.bind(this), false);
         document.addEventListener("click", this.eventList.bind(this), false);
     };
     this.eventList = function (event) {
         if (event.type === 'load' || event.type === 't4-after-ajax') {
             this.loadClearFilters();
         }
         if (event.type === 'click') {
             var filterElements = document.querySelectorAll(this.mainFilterSel + ', ' + this.mainFilterSel + ' *');
             for (var i = 0; i < filterElements.length; ++i) {
                 if (event.target === filterElements[i]) {
                     this.eventFilterBox(event);
                 }
             }
 
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' ' + this.clearFilterSel);
             for (var i = 0; i < containers.length; ++i) {
                 if (event.target === containers[i]) {
                     this.eventClearFilters(event);
                 }
             }
         }
     };
     this.eventFilterBox = function (event) {
         var clicked = event.target;
         if (!event.target.hasAttribute('data-t4-filter')) {
             var clicked = this.getParent(event.target,'[data-t4-filter]');
         }
         /*
            NOTE - As the ajax doesn't trigger on change or keydown need to trigger a click event on the submit button in the form for the ajax to run
         */
         if (clicked.hasAttribute('data-t4-filter')) {
             var name = clicked.getAttribute('data-t4-filter');
             if (clicked.hasAttribute('data-t4-value')) {
                 var category = clicked.getAttribute('data-t4-value');
                 //check for dropdown
                 var selectsArray = document.querySelectorAll('select[name="' + name + '"]');
                 for (var i = 0; i < selectsArray.length; i++) {
                     for (var x = 0; x < selectsArray[i].options.length; x++) {
                         if(selectsArray[i].options[x].getAttribute("value") == category && selectsArray[i].options[x].selected === true){
                     
                             selectsArray[i].options[x].selected = false;
                             selectsArray[i].value = '';
                             //selectsArray[i].dispatchEvent(this.getEvent('change'));
                             var form = selectsArray[i].closest('form');
                            if (form) {
                                var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                                if (submitButton) {
                                    submitButton.dispatchEvent(this.getEvent('click'));
                                }
                            }
                         }
                     }
                 }
                 
                 var checksArray = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=radio][name="' + name + '"][data-t4-value="' + category + '"],' + this.ajaxGroupSel + ' form input[type=checkbox][name="' + name + '"][data-t4-value="' + category + '"]');
               	for (var i = 0; i < checksArray.length; i++) {
                     checksArray[i].checked = false;
                     //checksArray[i].dispatchEvent(this.getEvent('change'));
                     var form = checksArray[i].closest('form');
                     if (form) {
                         var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                         if (submitButton) {
                             submitButton.dispatchEvent(this.getEvent('click'));
                         }
                     }
                 }
             } else {
                 var dateArray = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=date][name="' + name + '"]');
                 
                 for (var i = 0; i < dateArray.length; i++) {
                     dateArray[i].value = '';
                     //dateArray[i].dispatchEvent(this.getEvent('change'));
                     var form = dateArray[i].closest('form');
                    if (form) {
                        var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                        if (submitButton) {
                            submitButton.dispatchEvent(this.getEvent('click'));
                        }
                    }
                 }
 
                 var rangeArray = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=range][name="' + name + '"]');
                 
                 for (var i = 0; i < rangeArray.length; i++) {
                     rangeArray[i].value = rangeArray[i].getAttribute('max');
                     //rangeArray[i].dispatchEvent(this.getEvent('change'));
                     var form = rangeArray[i].closest('form');
                    if (form) {
                        var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                        if (submitButton) {
                            submitButton.dispatchEvent(this.getEvent('click'));
                        }
                    }
                 }
 
                 var inputArray = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=text][name="' + name + '"]');
 
                 for (var i = 0; i < inputArray.length; i++) {
    
                     inputArray[i].value = '';
                     //inputArray[i].dispatchEvent(this.getEvent('keydown'));
                     var form = inputArray[i].closest('form');
                     if (form) {
                         var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                         if (submitButton) {
                             submitButton.dispatchEvent(this.getEvent('click'));
                         }
                     }
                 }
             }
         } else {
             console.error('T4 Search: "' + this.mainFilterSel + '" should have attribute "data-t4-filter"');
         }
     };
     this.loadClearFilters = function(event) {
         var elements = document.querySelectorAll(this.clearFilterSel);
         if (elements.length > 0 ) {
             for (var y = 0; y < elements.length; ++y) {
                 
                 var value = elements[y].getAttribute('data-t4-clear');
                 if (value.indexOf(',')) {
                     var values = value.split(',');
                 } else {
                     var values = [value];
                 }
                 var found = false;
                 for (var k = 0; k < values.length; ++k) {
                     var element = values[k];
                     var containers = document.querySelectorAll(this.ajaxGroupSel + ' form select[name='+element+']');
                     if (containers.length > 0) {
                         for (var i = 0; i < containers.length; ++i) {
                             for (var x = 0; x < containers[i].options.length; x++) {
                                 if (containers[i].options[x].selected != false && containers[i].options[x].value != '') {
                                     found = true;
                                 }
                             }
                         }
                     }
 
                     var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=date][name='+element+'],' + this.ajaxGroupSel + ' form input[type=text][name='+element+']');
                     if (containers.length > 0) {
                         for (var i = 0; i < containers.length; ++i) {
                             if (containers[i].value != '') {
                                 found = true;
                             }
                         }
                     }
 
                     var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=radio][name='+element+'],' + this.ajaxGroupSel + ' form input[type=checkbox][name='+element+']');
                     if (containers.length > 0) {
                         for (var i = 0; i < containers.length; ++i) {
                             if (containers[i].checked != false) {
                                 found = true;
                             }
                         }
                     }
                     var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=range][name='+element+']');
                     if (containers.length > 0) {
                         for (var i = 0; i < containers.length; ++i) {
                             if (containers[i].value != containers[i].getAttribute('max')) {
                                 found = true;
                             }
                         }
                     }
                 }
                 if(found == false && !elements[y].classList.contains(this.hideClass)) {
                     elements[y].classList.add(this.hideClass);
                 } else if (found == true && elements[y].classList.contains(this.hideClass)) {
                     elements[y].classList.remove(this.hideClass);
                 }
             }
         }
     };
     this.eventClearFilters = function(event) {
         var value = event.target.getAttribute('data-t4-clear');
         if (value.indexOf(',')) {
             var values = value.split(',');
         } else {
             var values = [value];
         }
         var found = false;
         for (var k = 0; k < values.length; ++k) {
             var element = values[k];
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form select[name='+element+']');
             if (containers.length > 0) {
                 for (var i = 0; i < containers.length; ++i) {
                     for (var x = 0; x < containers[i].options.length; x++) {
                     containers[i].options[x].selected = false;
                     found = true;
                     }
                 }
             }
 
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=date][name='+element+'],' + this.ajaxGroupSel + ' form input[type=text][name='+element+']');
             if (containers.length > 0) {
                 for (var i = 0; i < containers.length; ++i) {
                     containers[i].value = '';
                     found = true;
                 }
             }
 
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=radio][name='+element+'],' + this.ajaxGroupSel + ' form input[type=checkbox][name='+element+']');
             if (containers.length > 0) {
                 for (var i = 0; i < containers.length; ++i) {
                     containers[i].checked = false;
                     found = true;
                 }
             }
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=range][name='+element+']');
             if (containers.length > 0) {
                 for (var i = 0; i < containers.length; ++i) {
                     containers[i].value = containers[i].getAttribute('max');
                     found = true;
                 }
             }
         }
         this.handleForm(event.target,this.ajaxGroupSel); 
     };
     this.constructor(this);
 }
 t4Filter.prototype = Object.create(t4Generic.prototype);
 t4Filter.prototype.constructor = t4Filter;
 function t4Search(attrs) {
     this.constructor = function () {
         this.ScrollToOffset = 0;
         this.ajaxGroupSel = '[data-t4-ajax-group$=Search]';
 
         //Change Attribues with User defined info
         for (var key in attrs) {
             if (typeof this[key] !== 'undefined' && this[key] !== null) {
                 this[key] = attrs[key];
             }
         }
 
         this.resultSel = '[role^=main]';
         this.ajaxLinkSel = '[data-t4-ajax-link]';
 
         this.keyUpTime;
         this.delayTimer;
         //If it is not possible to find the main container it will not trigger the JS
         //this.loadBeforeAndAfterAjax();
         document.addEventListener("click", this.eventList.bind(this), false);
         //document.addEventListener("change", this.eventList.bind(this), false);
         document.addEventListener("input", this.eventList.bind(this), false);
         //document.addEventListener("keyup", this.eventList.bind(this), false);
         //document.addEventListener("keydown", this.eventList.bind(this), false);
         addEventListener("popstate", this.eventList.bind(this), false);
     };
     this.eventList = function (event) {
         console.log('2 - ');
         console.log(event);
         var done = false;
         
         if (event.type === 'click') {
             if (document.querySelector(this.ajaxGroupSel + '' + this.resultSel) != null) {
                 
                 var containers = document.querySelectorAll(this.ajaxGroupSel + ' ' + this.ajaxLinkSel + ' a,' + this.ajaxGroupSel + ' a' + this.ajaxLinkSel);
                 for (var i = 0; i < containers.length; ++i) {
                     if (event.target === containers[i]) {
                         done = this.eventAjaxLink(event);
                     }
                 }
 
                 var containers = document.querySelectorAll(this.ajaxGroupSel + ' form *[type=submit],' + this.ajaxGroupSel + ' form button');
                 for (var i = 0; i < containers.length; ++i) {
                     if (event.target === containers[i]) {
                         this.eventButton(containers[i], this.ajaxGroupSel, event);
                         done = true;
                     }
                 }

             }
         }
 
         if (event.type === 'change') {
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form select,' + this.ajaxGroupSel + ' form input[type=date]');
             for (var i = 0; i < containers.length; ++i) {
                 if (event.target === containers[i]) {
                     this.handleForm(containers[i], this.ajaxGroupSel);
                 }
             }
 
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=checkbox],' + this.ajaxGroupSel + ' form input[type=radio]');
             for (var i = 0; i < containers.length; ++i) {
                 if (event.target === containers[i]) {
                     this.handleForm(containers[i], this.ajaxGroupSel);
                 }
             }
 
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=range]');
             for (var i = 0; i < containers.length; ++i) {
                 if (event.target === containers[i]) {
                     this.handleForm(containers[i], this.ajaxGroupSel);
                 }
             }

             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=hidden]');
            for (var i = 0; i < containers.length; ++i) {
                if (event.target === containers[i]) {
                    this.handleForm(containers[i], this.ajaxGroupSel);
                }
            }
         }
         if (event.type === 'keydown') {
             var containers = document.querySelectorAll(this.ajaxGroupSel + ' form input[type=text]');
 
             var isPrintableChars = (event.keyCode > 47 && event.keyCode < 58)   || // number keys
                                     event.keyCode == 32 || event.keyCode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
                                     (event.keyCode > 64 && event.keyCode < 91)   || // letter keys
                                     (event.keyCode > 95 && event.keyCode < 112)  || // numpad keys
                                     (event.keyCode > 185 && event.keyCode < 193) || // ;=,-./` (in order)
                                     (event.keyCode > 218 && event.keyCode < 223) || // [\]' (in order)
                                     (event.keyCode == 8) || // Backslash
                                     (event.keyCode == 229); //stock Samsung keyboard on Android all chars register as 229
 
             if ((isPrintableChars && event.isTrusted) || (!isPrintableChars && !event.isTrusted)) {
                 for (var i = 0; i < containers.length; ++i) {
                     if (event.target === containers[i] && event.keyCode == 27) {
                         event.target.value = '';
                     }
                     if (event.target === containers[i]) {
                         this.keyUpTime = new Date();
                         clearTimeout(this.delayTimer);
                         this.delayTimer = setTimeout(function () {
                             if ((this.self.keyUpTime - this.time) < 50) {
                                 this.self.handleForm(this.container, this.ajaxGroupSel);
                             }
                         }.bind({
                             self: this,
                             container: containers[i],
                             time: new Date(),
                             ajaxGroupSel: this.ajaxGroupSel
                         }), 500); // Will do the ajax stuff after 1000 ms, or 1 s
                         done = true;
                     }
                 }
 
                 if (event.target === containers[i] && event.keyCode == 13) {
                     done = true;
                 } else {
                     done = false;
                 }
 
             }
         }

         if (event.type === 'popstate') {
            var containers = document.querySelectorAll(this.ajaxGroupSel + '[role="main"]');
            if (containers.length > 0) {
                var link = window.location.href;
                var loadArea = containers[0];
                var done = this.runAjax(link, this.ajaxGroupSel, loadArea, false, true, false, false);
            }
         }
         
         if (done === true) {
             event.preventDefault(); // Cancel the native event
             event.stopPropagation(); // Don't bubble/capture the event
         }
     };
     this.eventAjaxLink = function (event) {
         var link = event.target.getAttribute("href");
         var parent = document.querySelectorAll(this.ajaxGroupSel);
 
         for (var i = 0; i < parent[i].length; ++i) {
             if (parent[i] !== event.target && parent[i].contains(event.target)) {
                 found = true;
             }
         }
         var loadArea = this.getParent(event.target, this.ajaxGroupSel);
         var checkScroll = this.getParent(event.target, '*[data-t4-scroll]') !== null || event.target.hasAttribute('data-t4-scroll');
         var disableCache = this.getParent(event.target, '*[data-t4-refresh]') !== null || event.target.hasAttribute('data-t4-refresh');
         console.log('3 - ');
         console.log(event);
         var done = this.runAjax(link, this.ajaxGroupSel, loadArea, false, true, disableCache);
 
         if (checkScroll) {
             /*var scrollOffsetElements = document.querySelectorAll('[data-t4-scroll-offset]');
             for (var i = 0; i < scrollOffsetElements.length; ++i) {
                 this.ScrollToOffset += scrollOffsetElements[i].offsetHeight;
             }
             var scrollToElement = loadArea.getBoundingClientRect();
             var scrollTo = scrollToElement.top + window.scrollY - this.ScrollToOffset;
             this.scrollTo(scrollTo, 1000);*/
            const element = document.getElementById("starthere");
          	var scrollOffsetElements = document.querySelectorAll('[data-t4-scroll-offset]');
            for (var i = 0; i < scrollOffsetElements.length; ++i) {
                this.ScrollToOffset += scrollOffsetElements[i].offsetHeight;
            }
          	var elementPosition = element.getBoundingClientRect().top;
          	var offsetPosition = elementPosition + window.pageYOffset - this.ScrollToOffset;
           	window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
         }
 
         return done;
     };
     this.eventButton = function (container, groupSel, event) {
         var loadArea = this.getParent(container, groupSel);
         if (loadArea == null) {
             console.error('T4Search: An occured error trying to handle form ' + groupSel);
         }
         var form = loadArea.querySelector("form");
         var url = window.location.pathname;
         if (form.getAttribute('action') !== null) {
             url = form.getAttribute('action');
         }
         var params = this.serializeArray(form);
         params[params.length] = {
             name: event.target.name,
             value: event.target.value
         };
         var query = Object.keys(params).map(function (k) {
             return encodeURIComponent(params[k]['name']) + '=' + encodeURIComponent(params[k]['value'])
         }).join('&')
 
         if (query != '') {
             url += '?' + query;
         }
         return this.runAjax(url, groupSel, loadArea);
     };
     this.scrollTo = function (to, scrollDuration) {
         var scrollStep = -window.scrollY / (scrollDuration / 15),
             scrollInterval = setInterval(function () {
                 if (window.scrollY > to) {
                     window.scrollBy(to, scrollStep);
                 } else {
                     clearInterval(scrollInterval)
                 };
             }, 15);
     }
     this.constructor(this);
 }
 t4Search.prototype = Object.create(t4Generic.prototype);
 t4Search.prototype.constructor = t4Search;
 

/**
   * Program Comparison bits
   */  
   
  // If 3 checkboxes are checked, the rest are disabled
  // ------------------------------------------------ //
  
  function updateCheckboxes() {
    
    const selectedElems = document.querySelectorAll('.program-listing--item.program-listing--selected');
    const checkboxes = document.querySelectorAll('.program-listing--item:not(.program-listing--selected) input[type="checkbox"]');

    const occupiedSlots = document.querySelectorAll('.program-comparison--sticky-panel li.program-comparison--slot.occupied');
  
    if (selectedElems.length >= 3 || occupiedSlots.length >= 3) {
      
      checkboxes.forEach((checkbox) => {
        checkbox.disabled = true;
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.disabled = false;
      });
    }
  }  
  
  // If a sticky-panel slot has a button, add a class to indicate that
  // ------------------------------------------------ //
  
  function occupiedCheck() {
    
    
    const stickyPanel = document.querySelector('.program-comparison--sticky-panel');
    const parentUnorderedList = document.querySelector('.program-comparison--sticky-panel ul');
   
    const occupiedSlots = document.querySelectorAll('li.program-comparison--slot.occupied');
    const occupiedCount = occupiedSlots.length;
    
    const pcAccordionButton = document.querySelector('.program-comparison--sticky-panel .accordion__button-text');
    
    if (pcAccordionButton) {
        pcAccordionButton.textContent = `Compare Programs (${occupiedCount})`;
    }

    if (parentUnorderedList) {
        if (occupiedCount >= 2) {
            parentUnorderedList.classList.remove('no-comparison');
        } else {
            parentUnorderedList.classList.add('no-comparison');
        }
    }

    if (stickyPanel) {
        if (occupiedCount >= 1) {
            stickyPanel.classList.add('visible');
            occupiedSlots.forEach(slot => {
            const checkboxId = slot.querySelector('button').getAttribute('checkbox-id');
            const checkboxClass = slot.querySelector(`button[checkbox-id=${checkboxId}]`).classList[1];
            const program = document.querySelector(`#${checkboxId}`);
            
            if (program) {
                
                program.checked = true;
                program.closest('.program-listing--item').classList.add(checkboxClass, 'program-listing--selected');
            } else {
                
            }
            })
        } else {
            stickyPanel.classList.remove('visible');
        }   
    }
  }
  
  // When you click a checkbox in the program comparison system
  // ------------------------------------------------ //

  // Get the comparison modal
const programListingTrigger = () => {
    const programListingItems = document.querySelectorAll('.program-listing--item');

    programListingItems.forEach((item) => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const checkboxId = checkbox.id;

        // Replace existing checkbox to remove all previous event listeners
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.replaceWith(newCheckbox);
        const updatedCheckbox = item.querySelector(`#${checkboxId}`);

        updatedCheckbox.addEventListener('change', (event) => {
            const name = item.querySelector('.program--name').textContent;
            var comparisonModal = document.querySelector('.program-comparison--modal .swiper-wrapper'); // Get all the program listing items

            if (event.target.checked) {
                const level = item.querySelector('.program--level').textContent;
                const summary = item.querySelector('.program--summary').textContent;
                const types = Array.from(item.querySelectorAll('.program--types li')).map(type => type.textContent);
                const degrees = Array.from(item.querySelectorAll('.program--degrees li')).map(degree => degree.textContent);
                const duration = item.querySelector('.program--duration').textContent;
                const credits = item.querySelector('.program--credits').textContent;
                const format = item.querySelector('.program--format').textContent;
                const areas_of_study = Array.from(item.querySelectorAll('.program--areas-of-study li')).map(area => area.textContent);
                const url = item.querySelector('.program--url').textContent;

                item.classList.add('program-listing--selected', `program--${checkboxId}`);

                const newDiv = document.createElement('div');
                newDiv.classList.add('swiper-slide', 'text-margin-reset', 'program-listing--selected', `program--${checkboxId}`);
                newDiv.innerHTML = `
                    <div class="innerspace">
                    <button type="button" class="program-card-button">
                    <span class="show-for-sr">Remove this program from comparison</span>
                    <span class="fas fa-times"></span>
                    </button>
                    <div class="eyebrow">${level}</div>
                    <h4>${name}</h4>
                    <p class="summary global-spacing--2x">${summary}</p>
                    <dl class="global-spacing--4x">
                        <dt>Program Type</dt>
                        <dd>${types.join(' or ')}</dd>
                        <dt>Degree</dt>
                        <dd>${degrees.join(' or ')}</dd>
                        <dt>Duration</dt>
                        <dd>${duration}</dd>
                        <dt>Credits</dt>
                        <dd>${credits}</dd>
                        <dt>Learning Format</dt>
                        <dd>${format}</dd>
                        <dt>Area of Study</dt>
                        <dd>${areas_of_study.join(' or ')}</dd>
                    </dl>
                    <a href="${url}" class="btn">More Information <span class="show-for-sr">about ${name}</span></a>
                    </div>
                `;
              	
                comparisonModal.appendChild(newDiv);

                const newButton = document.createElement('button');
                newButton.setAttribute('type', 'button');
                newButton.setAttribute('checkbox-id', checkboxId);
                newButton.classList.add('program-listing--selected', `program--${checkboxId}`);
                newButton.innerHTML = `
                <p><strong>${name}</strong></p>
                <p>${types.join(' or ')}, ${degrees.join(' or ')}</p>
                `;

                const stickyPanel = document.querySelector('.program-comparison--sticky-panel');
                if (stickyPanel) {
                    const firstLi = stickyPanel.querySelector('li:not(.occupied)');
                    if (firstLi) {
                        firstLi.classList.add('occupied');
                        firstLi.appendChild(newButton);
                    }
                }

                occupiedCheck();
                updateCheckboxes();
            } else {
                const nameClass = `.program--${checkboxId}`;
                item.classList.remove('program-listing--selected', nameClass);

                const newDiv = document.querySelector('.program-comparison--modal').querySelector(nameClass);
                if (newDiv) {
                    newDiv.remove();
                }

                const newButton = document.querySelector('.program-comparison--sticky-panel').querySelector(nameClass);
                if (newButton) {
                    const grandparentUL = newButton.closest("ul");
                    const parentElement = newButton.parentNode;

                    parentElement.remove();
                    newButton.remove();

                    const newListItem = document.createElement("li");
                    newListItem.className = "program-comparison--slot";
                    newListItem.innerHTML = '<span class="btn">Program <span></span> of 3</span>';

                    grandparentUL.appendChild(newListItem);
                }

                occupiedCheck();
                updateCheckboxes();
            }
        });
    });
}

programListingTrigger();



  const programListingWrappingTrigger = () => {

    

    // All of these program comparison bits need to be wrapped in the page class.
  // ------------------------------------------------ //      
    
  if (document.querySelectorAll('.page.program-listing').length) {

    
    // When you click a sticky panel close button
    // ------------------------------------------------ //    
  
    // add a click event listener to each button
    /*  
    document.querySelector('.program-comparison--sticky-panel ul').addEventListener("click", function(event) {

      

          if (event.target && event.target.matches("button")) {
            
            const button = event.target;
            const buttonCheckboxId = button.getAttribute('checkbox-id');
    
            // get all the classes of the button element
            const classes = button.classList;
        
            // iterate through each class of the button element
            classes.forEach((className) => {
              
              // check if the class is not the first class and starts with "program-listing"
              if (className !== 'program-listing--selected' && className.startsWith('program--')) {
                // get all elements with the same class
                const elementsToRemove = document.querySelectorAll(`.${className}`);
        
                // remove each element with the class
                elementsToRemove.forEach((element) => {
                  // check if the element is a div
                  if (element.tagName === 'DIV') {
                    element.remove();
                  }
                });
        
                // find the article element with the same class
                const article = document.querySelector(`article.${className}`);
                
                article ? article.classList.remove('program-listing--selected') : null
                
                // if the article has a checkbox that is checked, uncheck it
                if (article && article.querySelector('input[type="checkbox"]:checked')) {
                  article.querySelector('input[type="checkbox"]').checked = false;
                }
              }
            });
        
            // remove the button's parent element
            const grandparentUL = button.closest("ul");     
            const parentElement = button.parentNode;
               
            parentElement.remove();
            
            // Create a new list item element with the specified HTML code
            const newListItem = document.createElement("li");
            newListItem.className = "program-comparison--slot";
            newListItem.innerHTML = '<span class="btn">Program <span></span> of 3</span>';
            
            // Append the new list item to the grandparent element
            grandparentUL.appendChild(newListItem);
    
    
            occupiedCheck();
            updateCheckboxes();  
          };
        });
  */
    // For this one Fancybox modal, limit close options to ONLY the close button
    // ------------------------------------------------ //  
   
    document.querySelector('#program-comparison--modal').addEventListener('click', function(event) {
      
            // prevent closing if click was not on the close button
            if (!event.target.classList.contains('is-close')) {
              event.stopPropagation();
            }
    
        });
  
    // When you click a modal slider card close button
    // ------------------------------------------------ //    
    /* 
    document.querySelector('.program-comparison--modal .swiper-wrapper').addEventListener("click", function(event) {
      
    
            if (event.target && event.target.matches("button")) {
      
              const button = event.target;
              
                
                // get all of the classes of the parent card
                const parentSlide = button.closest(".swiper-slide");
                const parentCarousel = parentSlide.parentNode;
                const classes = parentSlide.classList;
                const closeButton = document.querySelector('.is-close');
                
                if (parentCarousel.childElementCount === 1) {
                  event.target.classList.add('is-close');
                  //Fancybox.close();
                }
              
                // iterate through each class of the button element
                classes.forEach((className) => {
                  
                  // find the class you want to use
                  if (className.startsWith('program--')) {
      
                    // find the article with the class, change it and uncheck its checkbox
                    
                    const article = document.querySelector(`article.${className}`);
                    
                    article ? article.classList.remove('program-listing--selected') : null
                    
                    // if the article has a checkbox that is checked, uncheck it
                    if (article && article.querySelector('input[type="checkbox"]:checked')) {
                      article.querySelector('input[type="checkbox"]').checked = false;
                    }   
                    
                    // find the button and remove it's parent slot, and add a new slot
                    
                    const slotButton =   document.querySelector(`button.${className}`);
                             
                    const grandparentUL = slotButton.closest("ul");     
                    const parentElement = slotButton.parentNode;
                    if(parentElement) {
                      parentElement.remove();
                    }
                    
                    
                    // Create a new list item element with the specified HTML code
                    const newListItem = document.createElement("li");
                    newListItem.className = "program-comparison--slot";
                    newListItem.innerHTML = '<span class="btn">Program <span></span> of 3</span>';
                    
                    // Append the new list item to the grandparent element
                    grandparentUL.appendChild(newListItem);   
                                
                    // remove itself
                    button.closest(".swiper-slide").remove();  
      
                    occupiedCheck();
                    updateCheckboxes();           
                  };
                });
    
            };
          });
*/
    } 
  }

  
  programListingWrappingTrigger();



/**
 * Accordion handler after ajax
 */


const slideDown = (element, duration) => {
  element.style.display = 'block';
  let startHeight = element.clientHeight;
  element.style.height = '0px';
  element.style.overflow = 'hidden';
  element.style.transition = `height ${duration}ms ease-out`;

  requestAnimationFrame(() => {
    element.style.height = startHeight + 'px';
  });

  setTimeout(() => {
    element.style.removeProperty('height');
    element.style.removeProperty('overflow');
    element.style.removeProperty('transition');
  }, duration);
};

const slideUp = (element, duration) => {
  element.style.height = element.clientHeight + 'px';
  element.style.overflow = 'hidden';
  element.style.transition = `height ${duration}ms ease-out`;

  requestAnimationFrame(() => {
    element.style.height = '0px';
  });

  setTimeout(() => {
    element.style.display = 'none';
    element.style.removeProperty('height');
    element.style.removeProperty('overflow');
    element.style.removeProperty('transition');
    element.style.removeProperty('display');
  }, duration);
};

const t4_accordionBtnsHandler = () => {
  const t4_accordionBtns = document.querySelectorAll('.accordion__button');

  t4_accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const accordion = btn.parentElement;
      const content = accordion.querySelector('.accordion__content');
      const isOpen = accordion.classList.contains('accordion--open');

      if (!isOpen) {
        accordion.classList.add('accordion--open');
        btn.setAttribute('aria-expanded', 'true');
        slideDown(content, 400);
      } else {
        accordion.classList.remove('accordion--open');
        btn.setAttribute('aria-expanded', 'false');
        slideUp(content, 400);
      }
    });
  });
};
