/* jshint node:true */
module.exports = {
  'framework': 'qunit',
  'test_page': 'tests/index.html?hidepassed',
  'disable_watching': true,
  'launch_in_ci': [
    'PhantomJS'
  ],
  'launch_in_dev': [
    'Chrome',
    'PhantomJS'
  ],
  'phantomjs_debug_port': 3000,
  'phantomjs_args': [
    '--ignore-ssl-errors=true'
  ]
}
