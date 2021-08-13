[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)


customRangeSlider
=================


A custom range slider with dual colors and text inputs. This extends (and requires) jQuery UI slider.

The slider.css file and images folder are there to make the example web page, customslider.html, work. They are simply jQuery UI slider styles and images.

It takes an options hash:

- ```minValue```
- ```maxValue```
- ```inputsToPost[selector1,selector2]``` -- is an array designating the form elements to actually post. The visible form elements in the UI are for display only.
  ```selector1``` is the lower value on the slider.
  ```selector2``` is the upper value.
- ```handleSlideCallback``` callback function on slide, will override the default behavior/validation when the handles are moved.
- ```handleManualInputCallback``` callback function on manual input will override the default behavior/validation when the values are changed by manual input. This should return the current value of the slider handle. 




