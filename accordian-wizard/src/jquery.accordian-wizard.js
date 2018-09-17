// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

	var $steps = [];

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variables rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "accWizard",
		defaults = {
			start: 1,
			mode: "wizard", // wizard or edit

			enableScrolling: true,
			scrollPadding: 5,


			autoButtons: true,
			autoButtonsNextClass: null,
			autoButtonsPrevClass: null,
			autoButtonsShowSubmit: true,
			autoButtonsSubmitText: 'Submit',

			stepNumbers: true,
			stepNumberClass: '',

			beforeNextStep: function( index ) { return true; }
		};

	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;

		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend( Plugin.prototype, {
		init: function() {

			var mthis = this;

			// Place initialization logic here
			// You already have access to the DOM element and
			// the options via the instance, e.g. this.element
			// and this.settings
			// you can add more functions like the one below and
			// call them like the example below

			// cache the steps
			this.$steps = $('[data-acc-step]');

			// get the initial acc-step height so we can calculate offset in animation
			this.stepHeight = $('[data-acc-step]').eq(0).outerHeight();

			// STEP NUMBERS
			if( this.settings.stepNumbers ) {
				this.$steps.each(function(i, el) {
					$('[data-acc-title]', el).prepend('<span class="acc-step-number '+mthis.settings.stepNumberClass+'">' + (i+1) + '</span> ');
				})
			}

			// AUTO BUTTONS
			if( this.settings.autoButtons ) {
				this.$steps.each(function(i, el) {

					var $content = $('[data-acc-content]', el);

					// Add prev, not on first
					if( i > 0 ) {
						$content.append('<a href="#" class="'+mthis.settings.autoButtonsPrevClass+'" data-acc-btn-prev>Back</a>');
					}

					// Add next, submit on last
					if( i < ( mthis.$steps.length - 1 ) ) {
						$content.append('<a href="#" class="'+mthis.settings.autoButtonsNextClass+'" data-acc-btn-next>Next</a>');
					} else if( mthis.settings.autoButtonsShowSubmit ) {
						$content.append('<input type="submit" class="'+mthis.settings.autoButtonsNextClass+'" value="'+mthis.settings.autoButtonsSubmitText+'">');
					}

				})
			}


			// set current
			this.currentIndex = this.settings.start - 1;

			if( this.settings.mode == 'wizard' ) {
				// WIZARD MODE

				this.activateStep( this.currentIndex, true );

				$('[data-acc-btn-next]').on('click', function() {
					if( mthis.settings.beforeNextStep( mthis.currentIndex ) ) {
						mthis.activateStep( mthis.currentIndex + 1 );
					}
				});

				$('[data-acc-btn-prev]').on('click', function() {
					mthis.activateStep( mthis.currentIndex - 1 );
				});

			} else if ( this.settings.mode == 'edit' ) {
				// EDIT MODE

				this.activateAllSteps();
				$('[data-acc-btn-next]').hide();
				$('[data-acc-btn-prev]').hide();

			}
		},
		deactivateStep: function(index, disableScrollOverride) {
			this.$steps.eq(index).removeClass('active');
		},
		activateStep: function(index, disableScrollOverride) {

			this.$steps.removeClass('open');

			var offset = index > this.currentIndex ? this.stepHeight : -this.stepHeight;

			if( !disableScrollOverride && this.settings.enableScrolling ) {
			    $('html').animate({
			        scrollTop: this.$steps.eq(this.currentIndex).offset().top + ( offset - this.settings.scrollPadding )
			    }, 500);
			}

	    	//$('.collapse', this.$steps.eq(index)).stop().collapse('show');
	    	$('[data-acc-content]', this.element).slideUp();

			this.$steps.eq(index)
				.addClass('open')
				.find('[data-acc-content]').slideDown();

			this.currentIndex = index;
		},
		activateNextStep: function() {
			this.activateStep( this.currentIndex + 1 );
		},
		activateAllSteps: function() {
			this.$steps.addClass('open');
			$('[data-acc-content]', this.element).show();
		}
	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" +
					pluginName, new Plugin( this, options ) );
			}
		} );
	};

} )( jQuery, window, document );