Deferred = require "../deferred"

describe "Deferred", ->
  describe "when with multi-arg duders", ->
    it "should work on an array of one", (done) ->
      deferred = Deferred()

      Deferred.when([
        deferred.promise()
      ]).then (results) ->
        assert.equal results.length, 1, "Results length should be 1"

        assert.equal results[0][0], "result", "First result should be 'result'"

        done()

      deferred.resolve("result", "wat")

    it "should work on an array of more than one", (done) ->
      deferred1 = Deferred()
      deferred2 = Deferred()

      Deferred.when([
        deferred1.promise()
        deferred2.promise()
      ]).then (results) ->
        assert.equal results.length, 2

        assert.equal results[0][0], "result1"
        assert.equal results[1][0], "result2"

        done()

      deferred1.resolve("result1", "wat")
      deferred2.resolve("result2", "wat")

    it "should work on an array of zero", (done) ->
      Deferred.when([]).then (results) ->
        assert.equal results.length, 0

        done()

  describe "when with single arg duders", ->
    it "should work on an array of one", (done) ->
      deferred = Deferred()

      Deferred.when([
        deferred.promise()
      ]).then (results) ->
        assert.equal results.length, 1, "Results length should be 1"

        assert.equal results[0], "result", "result should be 'result'"

        done()

      deferred.resolve("result")

    it "should work on an array of more than one", (done) ->
      deferred1 = Deferred()
      deferred2 = Deferred()

      Deferred.when([
        deferred1.promise()
        deferred2.promise()
      ]).then (results) ->
        assert.equal results.length, 2

        assert.equal results[0], "result1"
        assert.equal results[1], "result2"

        done()

      deferred1.resolve("result1")
      deferred2.resolve("result2")
