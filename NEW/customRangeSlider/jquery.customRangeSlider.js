/*jslint browser: true, white: true, vars: true, devel: true, bitwise: true, debug: true, nomen: true, sloppy: false, indent: 2*/
/*global $, jQuery*/

/*
 *
 * customRangeSlider
 * Version 1.0.0
 * @requires jQuery UI Slider
 *
 * To destroy, call .slider('destroy')
 *
 */

(function($) {
  "use strict";
  $.fn.customRangeSlider = function(options) {

    var $slider = $(this),
        defaults = {
          /*
           * inputsToPost are the form inputs that will actually be posted.
           * The moveable slider inputs are for display only.
           * The inputsToPost are hidden in the css by default.
           */
          inputsToPost: [
            $slider.find('.custom_slider_lower_input'),
            $slider.find('.custom_slider_upper_input')
          ],
          maxValue: 100,
          minValue: 0
        };

        options = $.extend(defaults, options);

    var customSlider = {

      $upperSliderColoredBar: null,
      $upperDisplayInput: null,
      $lowerDisplayInput: null,
      $upperInputToPost: options.inputsToPost[1],
      $lowerInputToPost: options.inputsToPost[0],
      sliding: false,
      upperRangeBarWidth: null,
      originalSettings: {},
      maxValue: options.maxValue,
      minValue: options.minValue,
      maxWidth: options.maxValue - options.minValue,
      handleSlideCallback: options.handleSlideCallback,
      handleManualInputCallback: options.handleManualInputCallback,

      init: function () {
        var self = this,
            upperValue = self.$upperInputToPost.val() || 70,
            lowerValue = self.$lowerInputToPost.val() || 40;

        self.originalSettings.upperValue = upperValue;
        self.originalSettings.lowerValue = lowerValue;
        self.upperRangeBarWidth = self.maxWidth - (upperValue - self.minValue);

        $slider.slider({
          range: true,
          min: self.minValue,
          max: self.maxValue,
          values: [
            lowerValue,
            upperValue
          ],
          slide: function(event, ui) {
            if (self.handleSlideCallback === undefined) {
              self.defaultSlideHandler(event, ui);
            } else {
              self.handleSlideCallback(event, ui);
              self.upperRangeBarWidth = self.maxWidth - (ui.values[ 1 ] - self.minValue);
              self.$upperSliderColoredBar.css('width', self.upperRangeBarWidth + '%');
            }
          }
        })
        .on('slidestart', function(e, ui) {
          $(ui.handle).css('z-index','3');
          if ($(ui.handle).find('.lower_slider_input').length > 0) {
            $(ui.handle).next('a').css('z-index','2');
          } else {
            $(ui.handle).prev('a').css('z-index','2');
          }
          self.sliding = true;
        })
        .on('slidestop', function(e, ui) {
          self.sliding = false;
        });

        this.setupUIElements();
        this.handleManualInput();
      },

      defaultSlideHandler: function(event, ui) {
        var self = this;
        self.$lowerInputToPost.val( ui.values[ 0 ] );
        self.$upperInputToPost.val( ui.values[ 1 ] );

        if (self.sliding) {
          self.$lowerDisplayInput.val( ui.values[0] );
          self.$upperDisplayInput.val( ui.values[1] );
        }

        self.upperRangeBarWidth = self.maxWidth - (ui.values[ 1 ] - self.minValue);
        self.$upperSliderColoredBar.css('width', self.upperRangeBarWidth + '%');
      },

      setupUIElements: function () {
        var self = this;
        var $lowerHandle = $slider.find('a').first(),
            $upperHandle = $slider.find('a').last();

        $slider.prepend('<div class="condition_slider ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all upper_slider" id="upper_slider_colored_bar" style="width:'+ self.upperRangeBarWidth + '%"></div>');

        this.$upperSliderColoredBar = $slider.find('#upper_slider_colored_bar');
        $lowerHandle.prepend("<input type='text' class='lower_slider_input' />");

        $upperHandle.prepend("<input type='text' class='upper_slider_input' />");

        this.$lowerDisplayInput = $slider.find('.lower_slider_input');
        this.$upperDisplayInput = $slider.find('.upper_slider_input');

        this.$lowerDisplayInput.val( Math.round( self.$lowerInputToPost.val() ) );
        this.$upperDisplayInput.val( Math.round( self.$upperInputToPost.val() ) );

      },

      handleManualInput: function () {
        var self = this,
            callBack = null;

        callBack = function (inputToCheck) {
          var value = null;
          if (self.handleManualInputCallback === undefined) {
            value = parseFloat($(this).val());
            value = self.defaultManualInputValidation.call(this, self, value, inputToCheck);
            self.afterManualInputChange(value, inputToCheck);
          } else {
            value = $(this).val();
            value = self.handleManualInputCallback(value);
            self.afterManualInputChange(value, inputToCheck);
          }
        };

        this.$upperDisplayInput.on('change', function() {
          if (!self.sliding) {
            callBack.call(this, 1);
          }
        });

        this.$lowerDisplayInput.on('change', function() {
          if (!self.sliding) {
            callBack.call(this, 0);
          }
        });
      },

      defaultManualInputValidation: function (self, value, inputToCheck) {
        if (isNaN(value)) {
          value = $slider.slider('values', inputToCheck);
        } else if (value > self.maxValue) {
          value = self.maxValue;
        } else if (value < self.minValue) {
          value = self.minValue;
        }
        if (inputToCheck === 1) {
          if ( value < self.$lowerDisplayInput.val() ) {
            value = self.$lowerDisplayInput.val();
          }
        } else if (inputToCheck === 0) {
          if ( value > self.$upperDisplayInput.val() ) {
            value = self.$upperDisplayInput.val();
          }
        }
        $(this).val(value);
        return value;
      },

      afterManualInputChange: function (value, inputToCheck) {
        var self = this;

        $slider.slider('values', inputToCheck, value);

        if (inputToCheck === 1) { // upper range check
          self.$upperInputToPost.val(value);

          if (value >= self.maxValue) {
            self.upperRangeBarWidth = 0;
          } else {
            self.upperRangeBarWidth = self.maxWidth - ( value - self.minValue);
          }
          self.$upperSliderColoredBar.css('width', self.upperRangeBarWidth + '%');
        } else if (inputToCheck === 0) {
          self.$lowerInputToPost.val(value);
        }
      }

    }; // end customSlider object

    customSlider.init();

    this.destroy = function () {
      this.slider('destroy');
      return this;
    };

    this.getCustomSlider = function () {
      return customSlider;
    }

    return this;

  }; // end customRangeSlider function
}(jQuery));