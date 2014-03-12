Packager
========

The main responsibilities of the packager are bundling dependencies, and
creating the package.

Specification
-------------

A package is a json object with the following properties:

`dependencies` an object whose keys are names of dependencies within our context
and whose values are packages.

`distribution` an object whose keys are extensionless file paths and whose
values are executable code compiled from the source files that exist at those paths.

`source` an object whose keys are file paths and whose values are source code.
The `source` can be loaded and modified in an editor to recreate the compiled
package.

If the environment or dependecies contain all the tools required to build the
package then theoretically `distribution` may be omitted as it can be recreated
from `source`.

For a "production" distribution `source` may be omitted, but that will greatly
limit adaptability of packages.

The package specification is closely tied to the `require` method. This allows
us to use a simplified Node.js style `require` from the browser.

[Require Docs](/require/docs)

Implementation
--------------

    Deferred = require "./deferred"

    Packager =

If our string is an absolute URL then we assume that the server is CORS enabled
and we can make a cross origin request to collect the JSON data.

We also handle a Github repo dependency. Something like `STRd6/issues:master`.
This uses JSONP to load the package from the gh-pages branch of the given repo.

`STRd6/issues:master` will be accessible at `http://strd6.github.io/issues/master.jsonp`.
The callback is the same as the repo info string: `window["STRd6/issues:master"](... DATA ...)`

Why all the madness? Github pages doesn't allow CORS right now, so we need to use
the JSONP hack to work around it. Because the files are static we can't allow the
server to generate a wrapper in response to our query string param so we need to
work out a unique one per file ahead of time. The `<user>/<repo>:<ref>` string is
unique for all our packages so we use it to determine the URL and name callback.

      collectDependencies: (dependencies, cachedDependencies={}) ->
        names = Object.keys(dependencies)

        Deferred.when(names.map (name) ->
          value = dependencies[name]

          if typeof value is "string"
            if startsWith(value, "http")
              $.getJSON(value)
            else
              if (match = value.match(/([^\/]*)\/([^\:]*)\:(.*)/))
                [callback, user, repo, branch] = match

                if cachedDependency = lookupCached(cachedDependencies, "#{user}/#{repo}", branch)
                  # DOUBLE HACK: Because jQuery deferreds are so bad
                  # we only need to make this an array if our length isn't exactly one
                  if names.length is 1
                    cachedDependency
                  else
                    [cachedDependency]
                else
                  url = "http://#{user}.github.io/#{repo}/#{branch}.json.js"
                  console.log "ajaxin", url
                  
                  $.ajax
                    url: url
                    dataType: "jsonp"
                    jsonpCallback: callback
                    cache: true
              else
                reject """
                  Failed to parse repository info string #{value}, be sure it's in the
                  form `<user>/<repo>:<ref>` for example: `STRd6/issues:master`
                  or `STRd6/editor:v0.9.1`
                """
          else
            reject "Can only handle url string dependencies right now"
        ).then (results) ->
          bundledDependencies = {}

          names.each (name, i) ->
            bundledDependencies[name] = results[i][0]

          return bundledDependencies

Create the standalone components of this package. An html page that loads the
main entry point for demonstration purposes and a json package that can be
used as a dependency in other packages.

The html page is named `index.html` and is in the folder of the ref, or the root
if our ref is the default branch.

Docs are generated and placed in `docs` directory as a sibling to `index.html`.

An application manifest is served up as a sibling to `index.html` as well.

The `.json.js` build product is placed into the root level, as siblings to the
folder containing `index.html`. If this branch is the default then these build
products are placed as siblings to `index.html`

The optional second argument is an array of files to be added to the final
package.

      standAlone: (pkg, files=[]) ->
        repository = pkg.repository
        branch = repository.branch

        if branch is repository.default_branch
          base = ""
        else
          base = "#{branch}/"

        add = (path, content) ->
          files.push
            content: content
            mode: "100644"
            path: path
            type: "blob"

        add "#{base}index.html", html(pkg)
        add "#{base}manifest.appcache", cacheManifest(pkg)

        json = JSON.stringify(pkg, null, 2)

        add "#{branch}.json.js", jsonpWrapper(repository, json)

        return files

Generates a standalone page for testing the app.

      testScripts: (pkg) ->
        {distribution} = pkg

        testProgram = Object.keys(distribution).filter (path) ->
          path.match /test\//
        .map (testPath) ->
          "require('./#{testPath}')"
        .join "\n"

        """
          #{dependencyScripts(pkg.remoteDependencies)}
          <script>
            #{packageWrapper(pkg, testProgram)}
          <\/script>
        """

    module.exports = Packager

Helpers
-------

    startsWith = (string, prefix) ->
      string.match RegExp "^#{prefix}"

Create a rejected deferred with the given message.

    reject = (message) ->
      Deferred().reject(message)

A standalone html page for a package.

    html = (pkg) ->
      """
        <!DOCTYPE html>
        <html manifest="manifest.appcache?#{+new Date}">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        #{dependencyScripts(pkg.remoteDependencies)}
        </head>
        <body>
        <script>
        #{packageWrapper(pkg, "require('./#{pkg.entryPoint}')")}
        <\/script>
        </body>
        </html>
      """

An HTML5 cache manifest for a package.

    cacheManifest = (pkg) ->
      """
        CACHE MANIFEST
        # #{+ new Date}

        CACHE:
        index.html
        #{(pkg.remoteDependencies or []).join("\n")}

        NETWORK:
        https://*
        http://*
        *
      """

`makeScript` returns a string representation of a script tag that has a src
attribute.

    makeScript = (src) ->
      "<script src=#{JSON.stringify(src)}><\/script>"

`dependencyScripts` returns a string containing the script tags that are
the remote script dependencies of this build.

    dependencyScripts = (remoteDependencies=[]) ->
      remoteDependencies.map(makeScript).join("\n")

Wraps the given data in a JSONP function wrapper. This allows us to host our
packages on Github pages and get around any same origin issues by using JSONP.

    jsonpWrapper = (repository, data) ->
      """
        window["#{repository.full_name}:#{repository.branch}"](#{data});
      """

Wrap code in a closure that provides the package and a require function. This
can be used for generating standalone HTML pages, scripts, and tests.

    packageWrapper = (pkg, code) ->
      """
        ;(function(PACKAGE) {
        var oldRequire = window.Require;
        #{PACKAGE.dependencies.require.distribution.main.content}
        var require = Require.generateFor(PACKAGE);
        window.Require = oldRequire;
        #{code}
        })(#{JSON.stringify(pkg, null, 2)});
      """

Lookup a package from a cached list of packages.

    lookupCached = (cache, fullName, branch) ->
      names = Object.keys(cache).filter (key) ->
        repository = cache[key].repository

        repository.full_name is fullName and repository.branch is branch

      if names?[0]
        cache[name]
