(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "mode": "100644",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "mode": "100644",
      "content": "packager\n========\n\nCreate standalone build products for web packages\n",
      "type": "blob"
    },
    "TODO.md": {
      "path": "TODO.md",
      "mode": "100644",
      "content": "TODO\n====\n\n- Remove jQuery dependency.\n",
      "type": "blob"
    },
    "deferred.coffee.md": {
      "path": "deferred.coffee.md",
      "mode": "100644",
      "content": "Deferred\n========\n\nUse jQuery.Deferred to implement deferreds, but\nstay insulated by not blasting the $ all over our code\nthat doesn't really depend on jQuery\nThis let's us swap our our Deferred provider more easily later.\n\n    global.Deferred = $.Deferred\n\nA helper to return a promise that may be resolved or rejected by the passed\ncode block.\n\n    withDeferrence = (fn) ->\n      deferred = Deferred()\n\n      # TODO: This try catch may be useless from deferring the fn\n      try\n        fn.defer(deferred)\n      catch e\n        deferred.reject(e)\n\n      return deferred.promise()\n\nA deferred encapsulating a confirm dialog.\n\n    Deferred.Confirm = (message) ->\n      withDeferrence (deferred) ->\n        if window.confirm(message)\n          deferred.resolve()\n        else\n          deferred.reject()\n\nA deferred that may present a confirm dialog, but only if a certain condition is\nmet.\n\n    Deferred.ConfirmIf = (flag, message) ->\n      if flag\n        return Deferred.Confirm(message)\n      else\n        withDeferrence (deferred) ->\n          deferred.resolve()\n\nA deferred that encapsulates a conditional execution of a block that returns a\npromise. If the condition is met the promise returning block is executed,\notherwise the deferred is marked as resolved and the block is not executed.\n\n    Deferred.ExecuteIf = (flag, callback) ->\n      withDeferrence (deferred) ->\n        if flag\n          callback().then deferred.resolve\n        else\n          deferred.resolve()\n\nA touched up version of jQuery's `when`. Succeeds if all promises succeed, fails\nif any promise fails. Handles jQuery weirdness if only operating on one promise.\n\nTODO: We should think about the case when there are zero promises. Probably\nsucceed with an empty array for results.\n\n    Deferred.when = (promises) ->\n      $.when.apply(null, promises)\n      .then (results...) ->\n        # WTF: jQuery.when behaves differently for one argument than it does for\n        # two or more.\n\n        if promises.length is 1\n          results = [results]\n        else\n          results\n\n        return results\n\n    module.exports = Deferred\n",
      "type": "blob"
    },
    "packager.coffee.md": {
      "path": "packager.coffee.md",
      "mode": "100644",
      "content": "Packager\n========\n\nThe main responsibilities of the packager are bundling dependencies, and\ncreating the package.\n\nSpecification\n-------------\n\nA package is a json object with the following properties:\n\n`dependencies` an object whose keys are names of dependencies within our context\nand whose values are packages.\n\n`distribution` an object whose keys are extensionless file paths and whose\nvalues are executable code compiled from the source files that exist at those paths.\n\n`source` an object whose keys are file paths and whose values are source code.\nThe `source` can be loaded and modified in an editor to recreate the compiled\npackage.\n\nIf the environment or dependecies contain all the tools required to build the\npackage then theoretically `distribution` may be omitted as it can be recreated\nfrom `source`.\n\nFor a \"production\" distribution `source` may be omitted, but that will greatly\nlimit adaptability of packages.\n\nThe package specification is closely tied to the `require` method. This allows\nus to use a simplified Node.js style `require` from the browser.\n\n[Require Docs](/require/docs)\n\nImplementation\n--------------\n\n    Deferred = require \"./deferred\"\n\n    Packager =\n      collectDependencies: (dependencies) ->\n        names = Object.keys(dependencies)\n\n        Deferred.when(names.map (name) ->\n          value = dependencies[name]\n\n          fetchDependency value\n\n        ).then (results) ->\n          bundledDependencies = {}\n\n          names.forEach (name, i) ->\n            bundledDependencies[name] = results[i][0]\n\n          return bundledDependencies\n\nCreate the standalone components of this package. An html page that loads the\nmain entry point for demonstration purposes and a json package that can be\nused as a dependency in other packages.\n\nThe html page is named `index.html` and is in the folder of the ref, or the root\nif our ref is the default branch.\n\nDocs are generated and placed in `docs` directory as a sibling to `index.html`.\n\nAn application manifest is served up as a sibling to `index.html` as well.\n\nThe `.json.js` build product is placed into the root level, as siblings to the\nfolder containing `index.html`. If this branch is the default then these build\nproducts are placed as siblings to `index.html`\n\nThe optional second argument is an array of files to be added to the final\npackage.\n\n      standAlone: (pkg, files=[]) ->\n        repository = pkg.repository\n        branch = repository.branch\n\n        if branch is repository.default_branch\n          base = \"\"\n        else\n          base = \"#{branch}/\"\n\n        add = (path, content) ->\n          files.push\n            content: content\n            mode: \"100644\"\n            path: path\n            type: \"blob\"\n\n        add \"#{base}index.html\", html(pkg)\n        add \"#{base}manifest.appcache\", cacheManifest(pkg)\n\n        json = JSON.stringify(pkg, null, 2)\n\n        add \"#{branch}.json.js\", jsonpWrapper(repository, json)\n\n        return files\n\nGenerates a standalone page for testing the app.\n\n      testScripts: (pkg) ->\n        {distribution} = pkg\n\n        testProgram = Object.keys(distribution).filter (path) ->\n          path.match /test\\//\n        .map (testPath) ->\n          \"require('./#{testPath}')\"\n        .join \"\\n\"\n\n        \"\"\"\n          #{dependencyScripts(pkg.remoteDependencies)}\n          <script>\n            #{packageWrapper(pkg, testProgram)}\n          <\\/script>\n        \"\"\"\n\n    module.exports = Packager\n\nHelpers\n-------\n\n    startsWith = (string, prefix) ->\n      string.match RegExp \"^#{prefix}\"\n\nCreate a rejected deferred with the given message.\n\n    reject = (message) ->\n      Deferred().reject(message).promise()\n\nA standalone html page for a package.\n\n    html = (pkg) ->\n      \"\"\"\n        <!DOCTYPE html>\n        <html manifest=\"manifest.appcache?#{+new Date}\">\n        <head>\n        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n        #{dependencyScripts(pkg.remoteDependencies)}\n        </head>\n        <body>\n        <script>\n        #{packageWrapper(pkg, \"require('./#{pkg.entryPoint}')\")}\n        <\\/script>\n        </body>\n        </html>\n      \"\"\"\n\nAn HTML5 cache manifest for a package.\n\n    cacheManifest = (pkg) ->\n      \"\"\"\n        CACHE MANIFEST\n        # #{+ new Date}\n\n        CACHE:\n        index.html\n        #{(pkg.remoteDependencies or []).join(\"\\n\")}\n\n        NETWORK:\n        https://*\n        http://*\n        *\n      \"\"\"\n\n`makeScript` returns a string representation of a script tag that has a src\nattribute.\n\n    makeScript = (src) ->\n      \"<script src=#{JSON.stringify(src)}><\\/script>\"\n\n`dependencyScripts` returns a string containing the script tags that are\nthe remote script dependencies of this build.\n\n    dependencyScripts = (remoteDependencies=[]) ->\n      remoteDependencies.map(makeScript).join(\"\\n\")\n\nWraps the given data in a JSONP function wrapper. This allows us to host our\npackages on Github pages and get around any same origin issues by using JSONP.\n\n    jsonpWrapper = (repository, data) ->\n      \"\"\"\n        window[\"#{repository.full_name}:#{repository.branch}\"](#{data});\n      \"\"\"\n\nWrap code in a closure that provides the package and a require function. This\ncan be used for generating standalone HTML pages, scripts, and tests.\n\n    packageWrapper = (pkg, code) ->\n      \"\"\"\n        ;(function(PACKAGE) {\n        var oldRequire = window.Require;\n        #{PACKAGE.dependencies.require.distribution.main.content}\n        var require = Require.generateFor(PACKAGE);\n        window.Require = oldRequire;\n        #{code}\n        })(#{JSON.stringify(pkg, null, 2)});\n      \"\"\"\n\nIf our string is an absolute URL then we assume that the server is CORS enabled\nand we can make a cross origin request to collect the JSON data.\n\nWe also handle a Github repo dependency such as `STRd6/issues:master`.\nThis uses JSONP to load the package from the gh-pages branch of the given repo.\n\n`STRd6/issues:master` will be accessible at `http://strd6.github.io/issues/master.json.js`.\nThe callback is the same as the repo info string: `window[\"STRd6/issues:master\"](... DATA ...)`\n\nWhy all the madness? Github pages doesn't allow CORS right now, so we need to use\nthe JSONP hack to work around it. Because the files are static we can't allow the\nserver to generate a wrapper in response to our query string param so we need to\nwork out a unique one per file ahead of time. The `<user>/<repo>:<ref>` string is\nunique for all our packages so we use it to determine the URL and name callback.\n\n    fetchDependency = _.memoize (path) ->\n      if typeof path is \"string\"\n        if startsWith(path, \"http\")\n          $.getJSON(path)\n        else\n          if (match = path.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))\n            [callback, user, repo, branch] = match\n\n            url = \"http://#{user}.github.io/#{repo}/#{branch}.json.js\"\n\n            $.ajax\n              url: url\n              dataType: \"jsonp\"\n              jsonpCallback: callback\n              cache: true\n          else\n            reject \"\"\"\n              Failed to parse repository info string #{path}, be sure it's in the\n              form `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\n              or `STRd6/editor:v0.9.1`\n            \"\"\"\n      else\n        reject \"Can only handle url string dependencies right now\"\n\nLookup a package from a cached list of packages.\n\n    lookupCached = (cache, fullName, branch) ->\n      names = Object.keys(cache).filter (key) ->\n        repository = cache[key].repository\n\n        repository.full_name is fullName and repository.branch is branch\n\n      if names?[0]\n        cache[name]\n",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "mode": "100644",
      "content": "version: \"0.5.6-pre.0\"\nentryPoint: \"packager\"\nremoteDependencies: [\n  \"https://code.jquery.com/jquery-1.11.0.min.js\"\n  \"https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js\"\n]\ndependencies:\n  require: \"distri/require:v0.4.2\"\n",
      "type": "blob"
    },
    "test/deferred.coffee": {
      "path": "test/deferred.coffee",
      "mode": "100644",
      "content": "Deferred = require \"../deferred\"\n\ndescribe \"Deferred\", ->\n  describe \"when with multi-arg duders\", ->\n    it \"should work on an array of one\", (done) ->\n      deferred = Deferred()\n\n      Deferred.when([\n        deferred.promise()\n      ]).then (results) ->\n        console.log results\n        assert.equal results.length, 1, \"Results length should be 1\"\n\n        assert.equal results[0][0], \"result\", \"First result should be 'result'\"\n\n        done()\n\n      deferred.resolve(\"result\", \"wat\")\n\n    it \"should work on an array of more than one\", (done) ->\n      deferred1 = Deferred()\n      deferred2 = Deferred()\n\n      Deferred.when([\n        deferred1.promise()\n        deferred2.promise()\n      ]).then (results) ->\n        assert.equal results.length, 2\n\n        assert.equal results[0][0], \"result1\"\n        assert.equal results[1][0], \"result2\"\n\n        done()\n\n      deferred1.resolve(\"result1\", \"wat\")\n      deferred2.resolve(\"result2\", \"wat\")\n\n    it \"should work on an array of zero\", (done) ->\n      Deferred.when([]).then (results) ->\n        assert.equal results.length, 0\n\n        done()\n\n  describe \"when with single arg duders\", ->\n    it \"should work on an array of one\", (done) ->\n      deferred = Deferred()\n\n      Deferred.when([\n        deferred.promise()\n      ]).then (results) ->\n        console.log results\n        assert.equal results.length, 1, \"Results length should be 1\"\n\n        assert.equal results[0], \"result\", \"result should be 'result'\"\n\n        done()\n\n      deferred.resolve(\"result\")\n\n    it \"should work on an array of more than one\", (done) ->\n      deferred1 = Deferred()\n      deferred2 = Deferred()\n\n      Deferred.when([\n        deferred1.promise()\n        deferred2.promise()\n      ]).then (results) ->\n        assert.equal results.length, 2\n\n        assert.equal results[0], \"result1\"\n        assert.equal results[1], \"result2\"\n\n        done()\n\n      deferred1.resolve(\"result1\")\n      deferred2.resolve(\"result2\")\n",
      "type": "blob"
    },
    "test/packager.coffee": {
      "path": "test/packager.coffee",
      "mode": "100644",
      "content": "Packager = require(\"../packager\")\n\n{dependencies} = require(\"../pixie\")\n\ndescribe \"Packager\", ->\n  it \"should exist\", ->\n    assert Packager\n\n  it \"should be able to create a standalone html page\", ->\n    assert Packager.standAlone(PACKAGE)\n\n  it \"should be able to collect remote dependencies\", ->\n    Packager.collectDependencies(dependencies)\n    .then (results) ->\n      console.log \"success\"\n      console.log results\n    , (errors) ->\n      console.log errors\n",
      "type": "blob"
    }
  },
  "distribution": {
    "deferred": {
      "path": "deferred",
      "content": "(function() {\n  var withDeferrence,\n    __slice = [].slice;\n\n  global.Deferred = $.Deferred;\n\n  withDeferrence = function(fn) {\n    var deferred, e;\n    deferred = Deferred();\n    try {\n      fn.defer(deferred);\n    } catch (_error) {\n      e = _error;\n      deferred.reject(e);\n    }\n    return deferred.promise();\n  };\n\n  Deferred.Confirm = function(message) {\n    return withDeferrence(function(deferred) {\n      if (window.confirm(message)) {\n        return deferred.resolve();\n      } else {\n        return deferred.reject();\n      }\n    });\n  };\n\n  Deferred.ConfirmIf = function(flag, message) {\n    if (flag) {\n      return Deferred.Confirm(message);\n    } else {\n      return withDeferrence(function(deferred) {\n        return deferred.resolve();\n      });\n    }\n  };\n\n  Deferred.ExecuteIf = function(flag, callback) {\n    return withDeferrence(function(deferred) {\n      if (flag) {\n        return callback().then(deferred.resolve);\n      } else {\n        return deferred.resolve();\n      }\n    });\n  };\n\n  Deferred.when = function(promises) {\n    return $.when.apply(null, promises).then(function() {\n      var results;\n      results = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      if (promises.length === 1) {\n        results = [results];\n      } else {\n        results;\n      }\n      return results;\n    });\n  };\n\n  module.exports = Deferred;\n\n}).call(this);\n",
      "type": "blob"
    },
    "packager": {
      "path": "packager",
      "content": "(function() {\n  var Deferred, Packager, cacheManifest, dependencyScripts, fetchDependency, html, jsonpWrapper, lookupCached, makeScript, packageWrapper, reject, startsWith;\n\n  Deferred = require(\"./deferred\");\n\n  Packager = {\n    collectDependencies: function(dependencies) {\n      var names;\n      names = Object.keys(dependencies);\n      return Deferred.when(names.map(function(name) {\n        var value;\n        value = dependencies[name];\n        return fetchDependency(value);\n      })).then(function(results) {\n        var bundledDependencies;\n        bundledDependencies = {};\n        names.forEach(function(name, i) {\n          return bundledDependencies[name] = results[i][0];\n        });\n        return bundledDependencies;\n      });\n    },\n    standAlone: function(pkg, files) {\n      var add, base, branch, json, repository;\n      if (files == null) {\n        files = [];\n      }\n      repository = pkg.repository;\n      branch = repository.branch;\n      if (branch === repository.default_branch) {\n        base = \"\";\n      } else {\n        base = \"\" + branch + \"/\";\n      }\n      add = function(path, content) {\n        return files.push({\n          content: content,\n          mode: \"100644\",\n          path: path,\n          type: \"blob\"\n        });\n      };\n      add(\"\" + base + \"index.html\", html(pkg));\n      add(\"\" + base + \"manifest.appcache\", cacheManifest(pkg));\n      json = JSON.stringify(pkg, null, 2);\n      add(\"\" + branch + \".json.js\", jsonpWrapper(repository, json));\n      return files;\n    },\n    testScripts: function(pkg) {\n      var distribution, testProgram;\n      distribution = pkg.distribution;\n      testProgram = Object.keys(distribution).filter(function(path) {\n        return path.match(/test\\//);\n      }).map(function(testPath) {\n        return \"require('./\" + testPath + \"')\";\n      }).join(\"\\n\");\n      return \"\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n<script>\\n  \" + (packageWrapper(pkg, testProgram)) + \"\\n<\\/script>\";\n    }\n  };\n\n  module.exports = Packager;\n\n  startsWith = function(string, prefix) {\n    return string.match(RegExp(\"^\" + prefix));\n  };\n\n  reject = function(message) {\n    return Deferred().reject(message).promise();\n  };\n\n  html = function(pkg) {\n    return \"<!DOCTYPE html>\\n<html manifest=\\\"manifest.appcache?\" + (+(new Date)) + \"\\\">\\n<head>\\n<meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n</head>\\n<body>\\n<script>\\n\" + (packageWrapper(pkg, \"require('./\" + pkg.entryPoint + \"')\")) + \"\\n<\\/script>\\n</body>\\n</html>\";\n  };\n\n  cacheManifest = function(pkg) {\n    return \"CACHE MANIFEST\\n# \" + (+(new Date)) + \"\\n\\nCACHE:\\nindex.html\\n\" + ((pkg.remoteDependencies || []).join(\"\\n\")) + \"\\n\\nNETWORK:\\nhttps://*\\nhttp://*\\n*\";\n  };\n\n  makeScript = function(src) {\n    return \"<script src=\" + (JSON.stringify(src)) + \"><\\/script>\";\n  };\n\n  dependencyScripts = function(remoteDependencies) {\n    if (remoteDependencies == null) {\n      remoteDependencies = [];\n    }\n    return remoteDependencies.map(makeScript).join(\"\\n\");\n  };\n\n  jsonpWrapper = function(repository, data) {\n    return \"window[\\\"\" + repository.full_name + \":\" + repository.branch + \"\\\"](\" + data + \");\";\n  };\n\n  packageWrapper = function(pkg, code) {\n    return \";(function(PACKAGE) {\\nvar oldRequire = window.Require;\\n\" + PACKAGE.dependencies.require.distribution.main.content + \"\\nvar require = Require.generateFor(PACKAGE);\\nwindow.Require = oldRequire;\\n\" + code + \"\\n})(\" + (JSON.stringify(pkg, null, 2)) + \");\";\n  };\n\n  fetchDependency = _.memoize(function(path) {\n    var branch, callback, match, repo, url, user;\n    if (typeof path === \"string\") {\n      if (startsWith(path, \"http\")) {\n        return $.getJSON(path);\n      } else {\n        if ((match = path.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))) {\n          callback = match[0], user = match[1], repo = match[2], branch = match[3];\n          url = \"http://\" + user + \".github.io/\" + repo + \"/\" + branch + \".json.js\";\n          return $.ajax({\n            url: url,\n            dataType: \"jsonp\",\n            jsonpCallback: callback,\n            cache: true\n          });\n        } else {\n          return reject(\"Failed to parse repository info string \" + path + \", be sure it's in the\\nform `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\\nor `STRd6/editor:v0.9.1`\");\n        }\n      }\n    } else {\n      return reject(\"Can only handle url string dependencies right now\");\n    }\n  });\n\n  lookupCached = function(cache, fullName, branch) {\n    var names;\n    names = Object.keys(cache).filter(function(key) {\n      var repository;\n      repository = cache[key].repository;\n      return repository.full_name === fullName && repository.branch === branch;\n    });\n    if (names != null ? names[0] : void 0) {\n      return cache[name];\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.5.6-pre.0\",\"entryPoint\":\"packager\",\"remoteDependencies\":[\"https://code.jquery.com/jquery-1.11.0.min.js\",\"https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js\"],\"dependencies\":{\"require\":\"distri/require:v0.4.2\"}};",
      "type": "blob"
    },
    "test/deferred": {
      "path": "test/deferred",
      "content": "(function() {\n  var Deferred;\n\n  Deferred = require(\"../deferred\");\n\n  describe(\"Deferred\", function() {\n    describe(\"when with multi-arg duders\", function() {\n      it(\"should work on an array of one\", function(done) {\n        var deferred;\n        deferred = Deferred();\n        Deferred.when([deferred.promise()]).then(function(results) {\n          console.log(results);\n          assert.equal(results.length, 1, \"Results length should be 1\");\n          assert.equal(results[0][0], \"result\", \"First result should be 'result'\");\n          return done();\n        });\n        return deferred.resolve(\"result\", \"wat\");\n      });\n      it(\"should work on an array of more than one\", function(done) {\n        var deferred1, deferred2;\n        deferred1 = Deferred();\n        deferred2 = Deferred();\n        Deferred.when([deferred1.promise(), deferred2.promise()]).then(function(results) {\n          assert.equal(results.length, 2);\n          assert.equal(results[0][0], \"result1\");\n          assert.equal(results[1][0], \"result2\");\n          return done();\n        });\n        deferred1.resolve(\"result1\", \"wat\");\n        return deferred2.resolve(\"result2\", \"wat\");\n      });\n      return it(\"should work on an array of zero\", function(done) {\n        return Deferred.when([]).then(function(results) {\n          assert.equal(results.length, 0);\n          return done();\n        });\n      });\n    });\n    return describe(\"when with single arg duders\", function() {\n      it(\"should work on an array of one\", function(done) {\n        var deferred;\n        deferred = Deferred();\n        Deferred.when([deferred.promise()]).then(function(results) {\n          console.log(results);\n          assert.equal(results.length, 1, \"Results length should be 1\");\n          assert.equal(results[0], \"result\", \"result should be 'result'\");\n          return done();\n        });\n        return deferred.resolve(\"result\");\n      });\n      return it(\"should work on an array of more than one\", function(done) {\n        var deferred1, deferred2;\n        deferred1 = Deferred();\n        deferred2 = Deferred();\n        Deferred.when([deferred1.promise(), deferred2.promise()]).then(function(results) {\n          assert.equal(results.length, 2);\n          assert.equal(results[0], \"result1\");\n          assert.equal(results[1], \"result2\");\n          return done();\n        });\n        deferred1.resolve(\"result1\");\n        return deferred2.resolve(\"result2\");\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "test/packager": {
      "path": "test/packager",
      "content": "(function() {\n  var Packager, dependencies;\n\n  Packager = require(\"../packager\");\n\n  dependencies = require(\"../pixie\").dependencies;\n\n  describe(\"Packager\", function() {\n    it(\"should exist\", function() {\n      return assert(Packager);\n    });\n    it(\"should be able to create a standalone html page\", function() {\n      return assert(Packager.standAlone(PACKAGE));\n    });\n    return it(\"should be able to collect remote dependencies\", function() {\n      return Packager.collectDependencies(dependencies).then(function(results) {\n        console.log(\"success\");\n        return console.log(results);\n      }, function(errors) {\n        return console.log(errors);\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://strd6.github.io/editor/"
  },
  "version": "0.5.6-pre.0",
  "entryPoint": "packager",
  "remoteDependencies": [
    "https://code.jquery.com/jquery-1.11.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"
  ],
  "repository": {
    "id": 13223375,
    "name": "packager",
    "full_name": "distri/packager",
    "owner": {
      "login": "distri",
      "id": 6005125,
      "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
      "gravatar_id": "192f3f168409e79c42107f081139d9f3",
      "url": "https://api.github.com/users/distri",
      "html_url": "https://github.com/distri",
      "followers_url": "https://api.github.com/users/distri/followers",
      "following_url": "https://api.github.com/users/distri/following{/other_user}",
      "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
      "organizations_url": "https://api.github.com/users/distri/orgs",
      "repos_url": "https://api.github.com/users/distri/repos",
      "events_url": "https://api.github.com/users/distri/events{/privacy}",
      "received_events_url": "https://api.github.com/users/distri/received_events",
      "type": "Organization",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/distri/packager",
    "description": "Create standalone build products for web packages",
    "fork": false,
    "url": "https://api.github.com/repos/distri/packager",
    "forks_url": "https://api.github.com/repos/distri/packager/forks",
    "keys_url": "https://api.github.com/repos/distri/packager/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/distri/packager/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/distri/packager/teams",
    "hooks_url": "https://api.github.com/repos/distri/packager/hooks",
    "issue_events_url": "https://api.github.com/repos/distri/packager/issues/events{/number}",
    "events_url": "https://api.github.com/repos/distri/packager/events",
    "assignees_url": "https://api.github.com/repos/distri/packager/assignees{/user}",
    "branches_url": "https://api.github.com/repos/distri/packager/branches{/branch}",
    "tags_url": "https://api.github.com/repos/distri/packager/tags",
    "blobs_url": "https://api.github.com/repos/distri/packager/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/distri/packager/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/distri/packager/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/distri/packager/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/distri/packager/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/distri/packager/languages",
    "stargazers_url": "https://api.github.com/repos/distri/packager/stargazers",
    "contributors_url": "https://api.github.com/repos/distri/packager/contributors",
    "subscribers_url": "https://api.github.com/repos/distri/packager/subscribers",
    "subscription_url": "https://api.github.com/repos/distri/packager/subscription",
    "commits_url": "https://api.github.com/repos/distri/packager/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/distri/packager/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/distri/packager/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/distri/packager/issues/comments/{number}",
    "contents_url": "https://api.github.com/repos/distri/packager/contents/{+path}",
    "compare_url": "https://api.github.com/repos/distri/packager/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/distri/packager/merges",
    "archive_url": "https://api.github.com/repos/distri/packager/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/distri/packager/downloads",
    "issues_url": "https://api.github.com/repos/distri/packager/issues{/number}",
    "pulls_url": "https://api.github.com/repos/distri/packager/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/distri/packager/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/distri/packager/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/distri/packager/labels{/name}",
    "releases_url": "https://api.github.com/repos/distri/packager/releases{/id}",
    "created_at": "2013-09-30T18:28:31Z",
    "updated_at": "2014-03-24T22:35:27Z",
    "pushed_at": "2014-03-24T22:35:29Z",
    "git_url": "git://github.com/distri/packager.git",
    "ssh_url": "git@github.com:distri/packager.git",
    "clone_url": "https://github.com/distri/packager.git",
    "svn_url": "https://github.com/distri/packager",
    "homepage": null,
    "size": 664,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "CoffeeScript",
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "forks_count": 0,
    "mirror_url": null,
    "open_issues_count": 0,
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "master",
    "master_branch": "master",
    "permissions": {
      "admin": true,
      "push": true,
      "pull": true
    },
    "organization": {
      "login": "distri",
      "id": 6005125,
      "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
      "gravatar_id": "192f3f168409e79c42107f081139d9f3",
      "url": "https://api.github.com/users/distri",
      "html_url": "https://github.com/distri",
      "followers_url": "https://api.github.com/users/distri/followers",
      "following_url": "https://api.github.com/users/distri/following{/other_user}",
      "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
      "organizations_url": "https://api.github.com/users/distri/orgs",
      "repos_url": "https://api.github.com/users/distri/repos",
      "events_url": "https://api.github.com/users/distri/events{/privacy}",
      "received_events_url": "https://api.github.com/users/distri/received_events",
      "type": "Organization",
      "site_admin": false
    },
    "network_count": 0,
    "subscribers_count": 1,
    "branch": "v0.5.6-pre.0",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "require": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "require\n=======\n\nRequire system for self replicating client side apps\n\n[Docs](http://distri.github.io/require/docs)\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Require\n=======\n\nA Node.js compatible require implementation for pure client side apps.\n\nEach file is a module. Modules are responsible for exporting an object. Unlike\ntraditional client side JavaScript, Ruby, or other common languages the module\nis not responsible for naming its product in the context of the requirer. This\nmaintains encapsulation because it is impossible from within a module to know\nwhat external name would be correct to prevent errors of composition in all\npossible uses.\n\nUses\n----\n\nFrom a module require another module in the same package.\n\n>     require \"./soup\"\n\nRequire a module in the parent directory\n\n>     require \"../nuts\"\n\nRequire a module from the root directory in the same package.\n\nNOTE: This could behave slightly differently under Node.js if your package does\nnot have it's own jailed filesystem.\n\n>     require \"/silence\"\n\nFrom a module within a package, require a dependent package.\n\n>     require \"console\"\n\nThe dependency will be delcared something like\n\n>     dependencies:\n>       console: \"http://strd6.github.io/console/v1.2.2.json\"\n\nImplementation\n--------------\n\nFile separator is '/'\n\n    fileSeparator = '/'\n\nIn the browser `global` is `window`.\n\n    global = window\n\nDefault entry point\n\n    defaultEntryPoint = \"main\"\n\nA sentinal against circular requires.\n\n    circularGuard = {}\n\nA top-level module so that all other modules won't have to be orphans.\n\n    rootModule =\n      path: \"\"\n\nRequire a module given a path within a package. Each file is its own separate\nmodule. An application is composed of packages.\n\n    loadPath = (parentModule, pkg, path) ->\n      if startsWith(path, '/')\n        localPath = []\n      else\n        localPath = parentModule.path.split(fileSeparator)\n\n      normalizedPath = normalizePath(path, localPath)\n\n      cache = cacheFor(pkg)\n\n      if module = cache[normalizedPath]\n        if module is circularGuard\n          throw \"Circular dependency detected when requiring #{normalizedPath}\"\n      else\n        cache[normalizedPath] = circularGuard\n\n        try\n          cache[normalizedPath] = module = loadModule(pkg, normalizedPath)\n        finally\n          delete cache[normalizedPath] if cache[normalizedPath] is circularGuard\n\n      return module.exports\n\nTo normalize the path we convert local paths to a standard form that does not\ncontain an references to current or parent directories.\n\n    normalizePath = (path, base=[]) ->\n      base = base.concat path.split(fileSeparator)\n      result = []\n\nChew up all the pieces into a standardized path.\n\n      while base.length\n        switch piece = base.shift()\n          when \"..\"\n            result.pop()\n          when \"\", \".\"\n            # Skip\n          else\n            result.push(piece)\n\n      return result.join(fileSeparator)\n\n`loadPackage` Loads a dependent package at that packages entry point.\n\n    loadPackage = (pkg) ->\n      path = pkg.entryPoint or defaultEntryPoint\n\n      loadPath(rootModule, pkg, path)\n\nLoad a file from within a package.\n\n    loadModule = (pkg, path) ->\n      unless (file = pkg.distribution[path])\n        throw \"Could not find file at #{path} in #{pkg.name}\"\n\n      program = annotateSourceURL file.content, pkg, path\n      dirname = path.split(fileSeparator)[0...-1].join(fileSeparator)\n\n      module =\n        path: dirname\n        exports: {}\n\nThis external context provides some variable that modules have access to.\n\nA `require` function is exposed to modules so they may require other modules.\n\nAdditional properties such as a reference to the global object and some metadata\nare also exposed.\n\n      context =\n        require: generateRequireFn(pkg, module)\n        global: global\n        module: module\n        exports: module.exports\n        PACKAGE: pkg\n        __filename: path\n        __dirname: dirname\n\n      args = Object.keys(context)\n      values = args.map (name) -> context[name]\n\nExecute the program within the module and given context.\n\n      Function(args..., program).apply(module, values)\n\n      return module\n\nHelper to detect if a given path is a package.\n\n    isPackage = (path) ->\n      if !(startsWith(path, fileSeparator) or\n        startsWith(path, \".#{fileSeparator}\") or\n        startsWith(path, \"..#{fileSeparator}\")\n      )\n        path.split(fileSeparator)[0]\n      else\n        false\n\nGenerate a require function for a given module in a package.\n\nIf we are loading a package in another module then we strip out the module part\nof the name and use the `rootModule` rather than the local module we came from.\nThat way our local path won't affect the lookup path in another package.\n\nLoading a module within our package, uses the requiring module as a parent for\nlocal path resolution.\n\n    generateRequireFn = (pkg, module=rootModule) ->\n      pkg.name ?= \"ROOT\"\n      pkg.scopedName ?= \"ROOT\"\n\n      (path) ->\n        if isPackage(path)\n          unless otherPackage = pkg.dependencies[path]\n            throw \"Package: #{path} not found.\"\n\n          otherPackage.name ?= path\n          otherPackage.scopedName ?= \"#{pkg.scopedName}:#{path}\"\n\n          loadPackage(otherPackage)\n        else\n          loadPath(module, pkg, path)\n\nBecause we can't actually `require('require')` we need to export it a little\ndifferently.\n\n    if exports?\n      exports.generateFor = generateRequireFn\n    else\n      global.Require =\n        generateFor: generateRequireFn\n\nNotes\n-----\n\nWe have to use `pkg` as a variable name because `package` is a reserved word.\n\nNode needs to check file extensions, but because we only load compiled products\nwe never have extensions in our path.\n\nSo while Node may need to check for either `path/somefile.js` or `path/somefile.coffee`\nthat will already have been resolved for us and we will only check `path/somefile`\n\nCircular dependencies are not allowed and raise an exception when detected.\n\nHelpers\n-------\n\nDetect if a string starts with a given prefix.\n\n    startsWith = (string, prefix) ->\n      string.lastIndexOf(prefix, 0) is 0\n\nCreates a cache for modules within a package. It uses `defineProperty` so that\nthe cache doesn't end up being enumerated or serialized to json.\n\n    cacheFor = (pkg) ->\n      return pkg.cache if pkg.cache\n\n      Object.defineProperty pkg, \"cache\",\n        value: {}\n\n      return pkg.cache\n\nAnnotate a program with a source url so we can debug in Chrome's dev tools.\n\n    annotateSourceURL = (program, pkg, path) ->\n      \"\"\"\n        #{program}\n        //# sourceURL=#{pkg.scopedName}/#{path}\n      \"\"\"\n\nDefinitions\n-----------\n\n### Module\n\nA module is a file.\n\n### Package\n\nA package is an aggregation of modules. A package is a json object with the\nfollowing properties:\n\n- `distribution` An object whose keys are paths and properties are `fileData`\n- `entryPoint` Path to the primary module that requiring this package will require.\n- `dependencies` An object whose keys are names and whose values are packages.\n\nIt may have additional properties such as `source`, `repository`, and `docs`.\n\n### Application\n\nAn application is a package which has an `entryPoint` and may have dependencies.\nAdditionally an application's dependencies may have dependencies. Dependencies\nmust be bundled with the package.\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.4.2\"\n",
          "type": "blob"
        },
        "samples/circular.coffee": {
          "path": "samples/circular.coffee",
          "mode": "100644",
          "content": "# This test file illustrates a circular requirement and should throw an error.\n\nrequire \"./circular\"\n",
          "type": "blob"
        },
        "samples/random.coffee": {
          "path": "samples/random.coffee",
          "mode": "100644",
          "content": "# Returns a random value, used for testing caching\n\nmodule.exports = Math.random()\n",
          "type": "blob"
        },
        "samples/terminal.coffee": {
          "path": "samples/terminal.coffee",
          "mode": "100644",
          "content": "# A test file for requiring a file that has no dependencies. It should succeed.\n\nexports.something = true\n",
          "type": "blob"
        },
        "samples/throws.coffee": {
          "path": "samples/throws.coffee",
          "mode": "100644",
          "content": "# A test file that throws an error.\n\nthrow \"yolo\"\n",
          "type": "blob"
        },
        "test/require.coffee.md": {
          "path": "test/require.coffee.md",
          "mode": "100644",
          "content": "Testing out this crazy require thing\n\n    # Load our latest require code for testing\n    # NOTE: This causes the root for relative requires to be at the root dir, not the test dir\n    latestRequire = require('/main').generateFor(PACKAGE)\n\n    describe \"PACKAGE\", ->\n      it \"should be named 'ROOT'\", ->\n        assert.equal PACKAGE.name, \"ROOT\"\n\n    describe \"require\", ->\n      it \"should not exist globally\", ->\n        assert !global.require\n\n      it \"should be able to require a file that exists with a relative path\", ->\n        assert latestRequire('/samples/terminal')\n\n      it \"should get whatever the file exports\", ->\n        assert latestRequire('/samples/terminal').something\n\n      it \"should not get something the file doesn't export\", ->\n        assert !latestRequire('/samples/terminal').something2\n\n      it \"should throw a descriptive error when requring circular dependencies\", ->\n        assert.throws ->\n          latestRequire('/samples/circular')\n        , /circular/i\n\n      it \"should throw a descriptive error when requiring a package that doesn't exist\", ->\n        assert.throws ->\n          latestRequire \"does_not_exist\"\n        , /not found/i\n\n      it \"should throw a descriptive error when requiring a relative path that doesn't exist\", ->\n        assert.throws ->\n          latestRequire \"/does_not_exist\"\n        , /Could not find file/i\n\n      it \"should recover gracefully enough from requiring files that throw errors\", ->\n        assert.throws ->\n          latestRequire \"/samples/throws\"\n\n        assert.throws ->\n          latestRequire \"/samples/throws\"\n        , (err) ->\n          !/circular/i.test err\n\n      it \"should cache modules\", ->\n        result = require(\"/samples/random\")\n\n        assert.equal require(\"/samples/random\"), result\n\n    describe \"module context\", ->\n      it \"should know __dirname\", ->\n        assert.equal \"test\", __dirname\n\n      it \"should know __filename\", ->\n        assert __filename\n\n      it \"should know its package\", ->\n        assert PACKAGE\n\n    describe \"dependent packages\", ->\n      PACKAGE.dependencies[\"test-package\"] =\n        distribution:\n          main:\n            content: \"module.exports = PACKAGE.name\"\n\n      PACKAGE.dependencies[\"strange/name\"] =\n        distribution:\n          main:\n            content: \"\"\n\n      it \"should raise an error when requiring a package that doesn't exist\", ->\n        assert.throws ->\n          latestRequire \"nonexistent\"\n        , (err) ->\n          /nonexistent/i.test err\n\n      it \"should be able to require a package that exists\", ->\n        assert latestRequire(\"test-package\")\n\n      it \"Dependent packages should know their names when required\", ->\n        assert.equal latestRequire(\"test-package\"), \"test-package\"\n\n      it \"should be able to require by pretty much any name\", ->\n        assert latestRequire(\"strange/name\")\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,\n    __slice = [].slice;\n\n  fileSeparator = '/';\n\n  global = window;\n\n  defaultEntryPoint = \"main\";\n\n  circularGuard = {};\n\n  rootModule = {\n    path: \"\"\n  };\n\n  loadPath = function(parentModule, pkg, path) {\n    var cache, localPath, module, normalizedPath;\n    if (startsWith(path, '/')) {\n      localPath = [];\n    } else {\n      localPath = parentModule.path.split(fileSeparator);\n    }\n    normalizedPath = normalizePath(path, localPath);\n    cache = cacheFor(pkg);\n    if (module = cache[normalizedPath]) {\n      if (module === circularGuard) {\n        throw \"Circular dependency detected when requiring \" + normalizedPath;\n      }\n    } else {\n      cache[normalizedPath] = circularGuard;\n      try {\n        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);\n      } finally {\n        if (cache[normalizedPath] === circularGuard) {\n          delete cache[normalizedPath];\n        }\n      }\n    }\n    return module.exports;\n  };\n\n  normalizePath = function(path, base) {\n    var piece, result;\n    if (base == null) {\n      base = [];\n    }\n    base = base.concat(path.split(fileSeparator));\n    result = [];\n    while (base.length) {\n      switch (piece = base.shift()) {\n        case \"..\":\n          result.pop();\n          break;\n        case \"\":\n        case \".\":\n          break;\n        default:\n          result.push(piece);\n      }\n    }\n    return result.join(fileSeparator);\n  };\n\n  loadPackage = function(pkg) {\n    var path;\n    path = pkg.entryPoint || defaultEntryPoint;\n    return loadPath(rootModule, pkg, path);\n  };\n\n  loadModule = function(pkg, path) {\n    var args, context, dirname, file, module, program, values;\n    if (!(file = pkg.distribution[path])) {\n      throw \"Could not find file at \" + path + \" in \" + pkg.name;\n    }\n    program = annotateSourceURL(file.content, pkg, path);\n    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);\n    module = {\n      path: dirname,\n      exports: {}\n    };\n    context = {\n      require: generateRequireFn(pkg, module),\n      global: global,\n      module: module,\n      exports: module.exports,\n      PACKAGE: pkg,\n      __filename: path,\n      __dirname: dirname\n    };\n    args = Object.keys(context);\n    values = args.map(function(name) {\n      return context[name];\n    });\n    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);\n    return module;\n  };\n\n  isPackage = function(path) {\n    if (!(startsWith(path, fileSeparator) || startsWith(path, \".\" + fileSeparator) || startsWith(path, \"..\" + fileSeparator))) {\n      return path.split(fileSeparator)[0];\n    } else {\n      return false;\n    }\n  };\n\n  generateRequireFn = function(pkg, module) {\n    if (module == null) {\n      module = rootModule;\n    }\n    if (pkg.name == null) {\n      pkg.name = \"ROOT\";\n    }\n    if (pkg.scopedName == null) {\n      pkg.scopedName = \"ROOT\";\n    }\n    return function(path) {\n      var otherPackage;\n      if (isPackage(path)) {\n        if (!(otherPackage = pkg.dependencies[path])) {\n          throw \"Package: \" + path + \" not found.\";\n        }\n        if (otherPackage.name == null) {\n          otherPackage.name = path;\n        }\n        if (otherPackage.scopedName == null) {\n          otherPackage.scopedName = \"\" + pkg.scopedName + \":\" + path;\n        }\n        return loadPackage(otherPackage);\n      } else {\n        return loadPath(module, pkg, path);\n      }\n    };\n  };\n\n  if (typeof exports !== \"undefined\" && exports !== null) {\n    exports.generateFor = generateRequireFn;\n  } else {\n    global.Require = {\n      generateFor: generateRequireFn\n    };\n  }\n\n  startsWith = function(string, prefix) {\n    return string.lastIndexOf(prefix, 0) === 0;\n  };\n\n  cacheFor = function(pkg) {\n    if (pkg.cache) {\n      return pkg.cache;\n    }\n    Object.defineProperty(pkg, \"cache\", {\n      value: {}\n    });\n    return pkg.cache;\n  };\n\n  annotateSourceURL = function(program, pkg, path) {\n    return \"\" + program + \"\\n//# sourceURL=\" + pkg.scopedName + \"/\" + path;\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.4.2\"};",
          "type": "blob"
        },
        "samples/circular": {
          "path": "samples/circular",
          "content": "(function() {\n  require(\"./circular\");\n\n}).call(this);\n\n//# sourceURL=samples/circular.coffee",
          "type": "blob"
        },
        "samples/random": {
          "path": "samples/random",
          "content": "(function() {\n  module.exports = Math.random();\n\n}).call(this);\n\n//# sourceURL=samples/random.coffee",
          "type": "blob"
        },
        "samples/terminal": {
          "path": "samples/terminal",
          "content": "(function() {\n  exports.something = true;\n\n}).call(this);\n\n//# sourceURL=samples/terminal.coffee",
          "type": "blob"
        },
        "samples/throws": {
          "path": "samples/throws",
          "content": "(function() {\n  throw \"yolo\";\n\n}).call(this);\n\n//# sourceURL=samples/throws.coffee",
          "type": "blob"
        },
        "test/require": {
          "path": "test/require",
          "content": "(function() {\n  var latestRequire;\n\n  latestRequire = require('/main').generateFor(PACKAGE);\n\n  describe(\"PACKAGE\", function() {\n    return it(\"should be named 'ROOT'\", function() {\n      return assert.equal(PACKAGE.name, \"ROOT\");\n    });\n  });\n\n  describe(\"require\", function() {\n    it(\"should not exist globally\", function() {\n      return assert(!global.require);\n    });\n    it(\"should be able to require a file that exists with a relative path\", function() {\n      return assert(latestRequire('/samples/terminal'));\n    });\n    it(\"should get whatever the file exports\", function() {\n      return assert(latestRequire('/samples/terminal').something);\n    });\n    it(\"should not get something the file doesn't export\", function() {\n      return assert(!latestRequire('/samples/terminal').something2);\n    });\n    it(\"should throw a descriptive error when requring circular dependencies\", function() {\n      return assert.throws(function() {\n        return latestRequire('/samples/circular');\n      }, /circular/i);\n    });\n    it(\"should throw a descriptive error when requiring a package that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"does_not_exist\");\n      }, /not found/i);\n    });\n    it(\"should throw a descriptive error when requiring a relative path that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"/does_not_exist\");\n      }, /Could not find file/i);\n    });\n    it(\"should recover gracefully enough from requiring files that throw errors\", function() {\n      assert.throws(function() {\n        return latestRequire(\"/samples/throws\");\n      });\n      return assert.throws(function() {\n        return latestRequire(\"/samples/throws\");\n      }, function(err) {\n        return !/circular/i.test(err);\n      });\n    });\n    return it(\"should cache modules\", function() {\n      var result;\n      result = require(\"/samples/random\");\n      return assert.equal(require(\"/samples/random\"), result);\n    });\n  });\n\n  describe(\"module context\", function() {\n    it(\"should know __dirname\", function() {\n      return assert.equal(\"test\", __dirname);\n    });\n    it(\"should know __filename\", function() {\n      return assert(__filename);\n    });\n    return it(\"should know its package\", function() {\n      return assert(PACKAGE);\n    });\n  });\n\n  describe(\"dependent packages\", function() {\n    PACKAGE.dependencies[\"test-package\"] = {\n      distribution: {\n        main: {\n          content: \"module.exports = PACKAGE.name\"\n        }\n      }\n    };\n    PACKAGE.dependencies[\"strange/name\"] = {\n      distribution: {\n        main: {\n          content: \"\"\n        }\n      }\n    };\n    it(\"should raise an error when requiring a package that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"nonexistent\");\n      }, function(err) {\n        return /nonexistent/i.test(err);\n      });\n    });\n    it(\"should be able to require a package that exists\", function() {\n      return assert(latestRequire(\"test-package\"));\n    });\n    it(\"Dependent packages should know their names when required\", function() {\n      return assert.equal(latestRequire(\"test-package\"), \"test-package\");\n    });\n    return it(\"should be able to require by pretty much any name\", function() {\n      return assert(latestRequire(\"strange/name\"));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/require.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.4.2",
      "entryPoint": "main",
      "repository": {
        "id": 12814740,
        "name": "require",
        "full_name": "distri/require",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/require",
        "description": "Require system for self replicating client side apps",
        "fork": false,
        "url": "https://api.github.com/repos/distri/require",
        "forks_url": "https://api.github.com/repos/distri/require/forks",
        "keys_url": "https://api.github.com/repos/distri/require/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/require/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/require/teams",
        "hooks_url": "https://api.github.com/repos/distri/require/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/require/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/require/events",
        "assignees_url": "https://api.github.com/repos/distri/require/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/require/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/require/tags",
        "blobs_url": "https://api.github.com/repos/distri/require/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/require/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/require/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/require/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/require/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/require/languages",
        "stargazers_url": "https://api.github.com/repos/distri/require/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/require/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/require/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/require/subscription",
        "commits_url": "https://api.github.com/repos/distri/require/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/require/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/require/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/require/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/require/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/require/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/require/merges",
        "archive_url": "https://api.github.com/repos/distri/require/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/require/downloads",
        "issues_url": "https://api.github.com/repos/distri/require/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/require/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/require/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/require/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/require/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/require/releases{/id}",
        "created_at": "2013-09-13T17:00:23Z",
        "updated_at": "2014-03-21T21:14:33Z",
        "pushed_at": "2014-03-21T21:14:34Z",
        "git_url": "git://github.com/distri/require.git",
        "ssh_url": "git@github.com:distri/require.git",
        "clone_url": "https://github.com/distri/require.git",
        "svn_url": "https://github.com/distri/require",
        "homepage": null,
        "size": 632,
        "stargazers_count": 1,
        "watchers_count": 1,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 1,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.4.2",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});