Packager = require("../packager")

{dependencies} = require("../pixie")

describe "Packager", ->
  describe "building a package", ->
    pkg = Packager.standAlone(PACKAGE)

    it "should be able to create a standalone html page", ->
      console.log pkg
      assert pkg
    
    it "should have the correct manifest links", ->
      manifest = pkg[1].content

      assert manifest.match /^master.json.js$/m
      assert manifest.match /^index.html$/m

    it "should have the correct script links", ->
      html = pkg[0].content

      assert html.match /src="master.json.js"/

  it "should be able to collect remote dependencies", (done) ->
    Packager.collectDependencies(dependencies)
    .then (results) ->
      done()
    , (errors) ->
      throw errors
