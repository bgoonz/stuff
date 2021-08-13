export default function (multianalytics) {

  return {
    test () {
      multianalytics.trackView({viewName: 'MySuperView'})
    }
  }
}
