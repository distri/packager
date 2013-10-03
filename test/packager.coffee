Packager = require("../packager")

describe "Packager", ->
  it "should exist", ->
    assert Packager

  it "should be able to create a standalone html page", ->
    assert Packager.standAlone(PACKAGE)
