// https://github.com/svg/svgo/blob/master/.svgo.yml

// multipass: true
//  full: true
module.exports =  {
  "plugins": [
    {
      "convertPathData": false
    },
    {
      "cleanupIDs": true
    },
    {
      "removeXMLNS": true
    },
    {
      "removeTitle": true
    },
    {
      "removeAttrs": {
        "attrs": [
          "stroke",
          "svg:height",
          "svg:width"
        ]
      }
    }
  ]
}

