var license = require('gulp-license');
var licenseInfo = {
    organization: 'Netflix, Inc',
    year: '2015'
};

module.exports = function buildLicense(fromPipe) {
    return fromPipe.
        pipe(license('Apache', licenseInfo));
};

