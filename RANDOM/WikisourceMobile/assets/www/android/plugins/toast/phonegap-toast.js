var ToastPlugin = function() {
};

ToastPlugin.prototype.show_long = function(message, win, fail) {
  PhoneGap.exec(win, fail, "ToastPlugin", "show_long", [message]);
};

ToastPlugin.prototype.show_short = function(message, win, fail) {
  PhoneGap.exec(win, fail, "ToastPlugin", "show_short", [message]);
};

/**
 * <ul>
 * <li>Register the ToastPlugin Javascript plugin.</li>
 * <li>Also register native call which will be called when this plugin runs</li>
 * </ul>
 */
cordova.addConstructor(function() { 
  window.ToastPlugin = new ToastPlugin();
});
