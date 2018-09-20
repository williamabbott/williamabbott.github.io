;( function( $, window, document, undefined ) {

	"use strict";

	var pluginName = "accWizard",
		defaults = {
			start: 1,
			mode: "wizard", // wizard, traditional, edit,

			enableScrolling: true,
			scrollPadding: 5,

			autoButtons: true,
			autoButtonsNextClass: null,
			autoButtonsPrevClass: null,
			autoButtonsShowSubmit: true,
			autoButtonsSubmitText: 'Submit',
			autoButtonsEditSubmitText: 'Save',

			stepNumbers: true,
			stepNumberClass: '',

			beforeNextStep: function( currentStep ) { return true; },
			onSubmit: function( element ) { return true; }
		};

	function Plugin ( element, options ) {
		this.element = element;
		this.$el = $(element);

		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend( Plugin.prototype, {
		init: function() {

			var mthis = this;

			// cache the steps
			this.$el.data('steps', $('[data-acc-step]', this.$el));

			// get the initial acc-step height so we can calculate offset in animation
			this.$el.data('stepHeight', $('[data-acc-step]', this.$el).eq(0).outerHeight());

			// autobuttons
			if( this.settings.autoButtons ) {
				this.$el.data('steps').each(function(i, el) {

					var $content = $('[data-acc-content]', el);

					// Add prev, not on first
					if( i > 0 ) {
						$content.append('<a href="#" class="'+mthis.settings.autoButtonsPrevClass+'" data-acc-btn-prev>Back</a>');
					}

					// Add next, submit on last
					if( i < ( mthis.$el.data('steps').length - 1 ) ) {
						$content.append('<a href="#" class="'+mthis.settings.autoButtonsNextClass+'" data-acc-btn-next>Next</a>');
					} else if( mthis.settings.autoButtonsShowSubmit ) {

						var btnText = mthis.settings.mode == 'wizard' ? mthis.settings.autoButtonsSubmitText : mthis.settings.autoButtonsEditSubmitText;

						$content.append('<input type="submit" class="' + mthis.settings.autoButtonsNextClass + '" value="' + btnText + '">');
					}

				})
			}

			// validate mode
			if( ['wizard', 'traditional', 'edit'].indexOf( this.settings.mode.toLowerCase() ) < 0 ) {
				console.log('mode not recognised, choosing wizard');
				this.settings.mode = 'wizard';
			}

			// set current
			this.$el.data('currentIndex', this.settings.start - 1);

			if( this.settings.mode == 'wizard' || this.settings.mode == 'traditional' ) {

				this.activateStep( this.$el.data('currentIndex'), true );

				$('[data-acc-btn-next]', this.$el).on('click', function() {
					if( mthis.settings.beforeNextStep( mthis.$el.data('currentIndex') + 1 ) ) {
						mthis.activateStep( mthis.$el.data('currentIndex') + 1 );
					}
				});

				$('[data-acc-btn-prev]', this.$el).on('click', function() {
					mthis.activateStep( mthis.$el.data('currentIndex') - 1 );
				});

				if( this.settings.mode == 'traditional' ) {

					var $step_indicators = $('[data-acc-step-indicators]');

					for( var i in this.$el.data('steps') ) {

					}

					//data-acc-step-indicators
				}


			} else if ( this.settings.mode == 'edit' ) {
				// 'edit' mode

				this.activateAllSteps();
				$('[data-acc-btn-next]').hide();
				$('[data-acc-btn-prev]').hide();

			}

			// step numbers
			if( this.settings.stepNumbers ) {
				this.$el.data('steps').each(function(i, el) {
					$('[data-acc-title]', el).prepend('<span class="acc-step-number '+mthis.settings.stepNumberClass+'">' + (i+1) + '</span> ');
				})
			}


			// onsubmit
			$(this.$el).on('submit', function(e) {
				var resp = mthis.settings.onSubmit();
				if( !resp )
					e.preventDefault();
			});

		},
		deactivateStep: function(index, disableScrollOverride) {
			this.$el.data('steps').eq(index).removeClass('active');
		},
		activateStep: function(index, disableScrollOverride) {

			console.log(this.settings.mode);

			this.$el.data('steps').removeClass('open');

			var offset = index > this.$el.data('currentIndex') ? this.$el.data('stepHeight') : -this.$el.data('stepHeight');

			if( !disableScrollOverride && this.settings.enableScrolling ) {
			    $('html').animate({
			        scrollTop: this.$el.data('steps').eq(this.$el.data('currentIndex')).offset().top + ( offset - this.settings.scrollPadding )
			    }, 500);
			}

			if( this.settings.mode == 'wizard' ) {

				$('[data-acc-content]', this.$el).slideUp();

				this.$el.data('steps').eq(index)
					.addClass('open')
					.find('[data-acc-content]').slideDown();

			} else if( this.settings.mode == 'traditional' ) {

				$('[data-acc-content]', this.$el).hide();

				this.$el.data('steps').eq(index)
					.addClass('open')
					.find('[data-acc-content]').show();
			}

			this.$el.data('currentIndex', index);
		},
		activateNextStep: function() {
			this.activateStep( this.$el.data('currentIndex') + 1 );
		},
		activateAllSteps: function() {
			this.$el.data('steps').addClass('open');
			$('[data-acc-content]', this.$el).show();
		}
	});

	// wrap up
	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" +
					pluginName, new Plugin( this, options ) );
			}
		} );
	};

} )( jQuery, window, document );