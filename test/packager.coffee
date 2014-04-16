Packager = require("../packager")

{dependencies} = require("../pixie")

describe "Packager", ->
  it "should be able to create a standalone html page", ->
    result = Packager.standAlone(PACKAGE)
    console.log result
    assert result

  it "should be able to collect remote dependencies", ->
    Packager.collectDependencies(dependencies)
    .then (results) ->
      console.log "success"
      console.log results
    , (errors) ->
      console.log errors
