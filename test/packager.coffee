Packager = require("../packager")

{dependencies} = require("../pixie")

describe "Packager", ->
  describe "building a package", ->
    pkg = Packager.standAlone(PACKAGE)
    relativeScriptPath = Packager.relativePackageScriptPath(PACKAGE)

    it "should have the correct manifest links", ->
      manifest = pkg[1].content

      assert manifest.match(///^#{relativeScriptPath}$///m)
      assert manifest.match(/^index.html$/m)

    it "should have the correct script links", ->
      html = pkg[0].content

      assert html.match ///src="#{relativeScriptPath}"///

  it "should fail to build if a resource doesn't exist", (done) ->
    Packager.collectDependencies(
      notFound: "distri/does_not_exist:v0.0.0"
    ).fail ({statusText}) ->
      assert.equal statusText, "timeout"
      done()
    .done()

  it "should be able to collect remote dependencies", (done) ->
    Packager.collectDependencies(dependencies)
    .then (results) ->
      done()
    , (errors) ->
      throw errors
