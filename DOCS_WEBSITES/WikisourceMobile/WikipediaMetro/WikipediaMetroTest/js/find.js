function findInElement(element, query) {
    var range = document.body.createTextRange();
    if (query !== '') {
        if (range.findText(query)) {
            try {
                range.select();
            } catch (e) {
                console.log(e);
            }
        }
    }
}
