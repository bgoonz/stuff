/* eslint-env node */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.initConfig( {
		banana: {
			all: 'i18n/'
		},
		eslint: {
			options: {
				cache: true
			},
			all: [
				'**/*.{js,json}',
				'!node_modules/**',
				'!vendor/**'
			]
		},
		stylelint: {
			all: [
				'**/*.css',
				'!node_modules/**',
				'!vendor/**'
			]
		}
	} );
	grunt.registerTask( 'test', [ 'banana', 'eslint', 'stylelint' ] );
	grunt.registerTask( 'default', 'test' );
};
