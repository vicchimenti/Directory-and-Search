
window.addEventListener('DOMContentLoaded', function() {	
    new Funnelback.SessionCart({
        apiBase: 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/cart.json',
        collection: 'seattleu~sp-search',
        iconPrefix: '',
        cartCount: {
            template: '{{>icon-block}} {{>label-block}} ({{count}})',
            icon: 'fas fa-star',
            label: 'Shortlist',
            isLabel: true,
            classes: "",
            enableClick: false,
            elementType: "span",
            tabIndex: "-1",
        },
        cart: {
            icon: '',
            label: '',
            backIcon: 'fas fa-arrow-left',
            backLabel: 'Back to results',
            clearIcon: 'fas fa-times',
            clearClasses: "btn btn-xs btn-light",                    
            emptyMessage: '<span id="flb-cart-empty-message">No items in your shortlist</span>',
        },
        item: {
            icon: 'fas fa-star',          
            templates: {
                'default': document.getElementById('shortlist-template-default').text,
                'seattleu~ds-programs': document.getElementById('shortlist-template-programs').text
            },
            class: ''
        },
        resultItemTrigger: {
            selector: '.enable-cart-on-result',
            class: '',
            labelAdd: 'ADD TO SHORTLIST',
            iconAdd: 'far fa-star',
            labelDelete: 'REMOVE FROM SHORTLIST',
            iconDelete: 'fas fa-star',
            isLabel: true,
            template: '{{>icon-block}} {{>label-block}}',
            position: 'afterbegin'
        },
        /* Trigger to delete an item from the cart */
        cartItemTrigger: {
            selector: ".fb-cart__remove",
            iconDelete: "fas",
            template: '{{>icon-block}}{{>label-block}}',
            position: 'afterbegin',
            isLabel: true,
            labelDelete: "REMOVE FROM SHORTLIST"
        }        
    });
});
