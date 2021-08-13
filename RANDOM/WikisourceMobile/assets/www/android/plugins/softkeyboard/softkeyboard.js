function SoftKeyBoard() {}

SoftKeyBoard.prototype.show = function(win, fail) {
    return PhoneGap.exec(
            function (args) { if(win !== undefined) { win(args); } }, 
            function (args) { if(fail !== undefined) { fail(args); } }, 
            "SoftKeyBoard", 
            "show", 
            []);	
};

SoftKeyBoard.prototype.hide = function(win, fail) {
    return PhoneGap.exec(
            function (args) { if(win !== undefined) { win(args); } }, 
            function (args) { if(fail !== undefined) { fail(args); } },
            "SoftKeyBoard", 
            "hide", 
            []);	
};

cordova.addConstructor(function() {
	window.SoftKeyBoard = new SoftKeyBoard();
});
