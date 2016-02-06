Packager = require("../packager")

{dependencies} = require("../pixie")

describe "Packager", ->
  describe "building a package", ->
    pkg = Packager.standAlone(PACKAGE)
    relativeScriptPath = Packager.relativePackageScriptPath(PACKAGE)

    console.log pkg

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
    ).fail (message) ->
      assert.equal message, "Failed to load package 'distri/does_not_exist:v0.0.0' from https://distri.github.io/does_not_exist/v0.0.0.json.js"
      done()
    .done()

  it "should be able to collect remote dependencies", (done) ->
    Packager.collectDependencies(dependencies)
    .then (results) ->
      assert.equal results.require.entryPoint, "main"
      done()
    , (errors) ->
      throw errors

describe "http dependencies", ->
  it "should be able to have http dependencies", (done) ->
    Packager.collectDependencies
      httpRemote: "https://s3.amazonaws.com/trinket/18894/data/00090d8da958fb538def3533dcf1ff3a85bc2054"
    .then (dependencies) ->
      assert dependencies.httpRemote
      console.log dependencies
      done()
    .done()

  it "should display an error message when file is not found", (done) ->
    Packager.collectDependencies
      httpRemote: "https://s3.amazonaws.com/trinket/18894/data/notfoundnotarealsha"
    .fail (message) ->
      assert.equal message, "404 Not Found: https://s3.amazonaws.com/trinket/18894/data/notfoundnotarealsha"
      done()
    .done()

  it "should display an error message when domain is not legit", (done) ->
    Packager.collectDependencies
      httpRemote: "https://notfound.yolo.biz.info/duder.json"
    .fail (message) ->
      assert.equal message, "0 Aborted: https://notfound.yolo.biz.info/duder.json"
      done()
    .done()
