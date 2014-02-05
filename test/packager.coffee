Packager = require("../packager")

{dependencies} = require("../pixie")

describe "Packager", ->
  it "should exist", ->
    assert Packager

  it "should be able to create a standalone html page", ->
    assert Packager.standAlone(PACKAGE)

  it "should be able to collect remote dependencies", ->
    Packager.collectDependencies(dependencies)
    .then (results) ->
      console.log "success"
      console.log results
    , (errors) ->
      console.log errors
