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
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "Packager\n========\n\nThe main responsibilities of the packager are bundling dependencies, and\ncreating the package.\n\nSpecification\n-------------\n\nA package is a json object with the following properties:\n\n`dependencies` an object whose keys are names of dependencies within our context\nand whose values are packages.\n\n`distribution` an object whose keys are extensionless file paths and whose\nvalues are executable code compiled from the source files that exist at those paths.\n\n`source` an object whose keys are file paths and whose values are source code.\nThe `source` can be loaded and modified in an editor to recreate the compiled\npackage.\n\nIf the environment or dependecies contain all the tools required to build the\npackage then theoretically `distribution` may be omitted as it can be recreated\nfrom `source`.\n\nFor a \"production\" distribution `source` may be omitted, but that will greatly\nlimit adaptability of packages.\n\nThe package specification is closely tied to the `require` method. This allows\nus to use a simplified Node.js style `require` from the browser.\n\n[Require Docs](http://distri.github.io/require/docs)\n",
      "mode": "100644",
      "type": "blob"
    },
    "TODO.md": {
      "path": "TODO.md",
      "content": "TODO\n====\n\n- Remove jQuery dependency.\n",
      "mode": "100644",
      "type": "blob"
    },
    "packager.coffee.md": {
      "path": "packager.coffee.md",
      "content": "Packager\n========\n\nThe main responsibilities of the packager are bundling dependencies, and\ncreating the package.\n\nSpecification\n-------------\n\nA package is a json object with the following properties:\n\n`dependencies` an object whose keys are names of dependencies within our context\nand whose values are packages.\n\n`distribution` an object whose keys are extensionless file paths and whose\nvalues are executable code compiled from the source files that exist at those paths.\n\n`source` an object whose keys are file paths and whose values are source code.\nThe `source` can be loaded and modified in an editor to recreate the compiled\npackage.\n\nIf the environment or dependecies contain all the tools required to build the\npackage then theoretically `distribution` may be omitted as it can be recreated\nfrom `source`.\n\nFor a \"production\" distribution `source` may be omitted, but that will greatly\nlimit adaptability of packages.\n\nThe package specification is closely tied to the `require` method. This allows\nus to use a simplified Node.js style `require` from the browser.\n\nDependencies\n------------\n\n    Q = require \"q\"\n\n    MemoizePromise = require \"memoize_promise\"\n\nHelpers\n-------\n\nThe path to the published jsonp script. This is the primary build product and is\nused when requiring in other packages and running standalone html.\n\n    jsonpScriptPath = ({repository:{branch}}) ->\n      \"#{branch}.json.js\"\n\nCheck if repository is publishing to default branch.\n\n    isDefault = (pkg) ->\n      {repository} = pkg\n      {branch} = repository\n\n      branch is repository.default_branch\n\nRelative package script tag.\n\n    relativePackageScript = (pkg) ->\n      path = relativePackageScriptPath(pkg)\n\n      \"<script src=#{JSON.stringify(path)}><\\/script>\"\n\n    relativePackageScriptPath = (pkg) ->\n      if isDefault(pkg)\n        jsonpScriptPath(pkg)\n      else\n        \"../#{jsonpScriptPath(pkg)}\"\n\nLauncher\n\n    launcherScript = (pkg) ->\n      \"\"\"\n        <script>\n          window[\"#{jsonpFnName(pkg)}\"] = function(PACKAGE) {\n            delete window[\"#{jsonpFnName(pkg)}\"];\n            var oldRequire = window.Require;\n            #{PACKAGE.dependencies.require.distribution.main.content};\n            var require = Require.generateFor(PACKAGE);\n            window.Require = oldRequire;\n            require('./' + PACKAGE.entryPoint);\n          };\n        <\\/script>\n      \"\"\"\n\n    startsWith = (string, prefix) ->\n      string.match RegExp \"^#{prefix}\"\n\nCreate a rejected promise with the given message.\n\n    reject = (message) ->\n      Q.fcall -> throw message\n\nA standalone html page for a package.\n\n    html = (pkg) ->\n      \"\"\"\n        <!DOCTYPE html>\n        <html manifest=\"manifest.appcache?#{+new Date}\">\n          <head>\n            <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n            #{dependencyScripts(pkg.remoteDependencies)}\n          </head>\n          <body>\n            #{launcherScript(pkg)}\n            #{relativePackageScript(pkg)}\n          </body>\n        </html>\n      \"\"\"\n\nAn HTML5 cache manifest for a package.\n\n    cacheManifest = (pkg) ->\n      # TODO: Add js file\n      \"\"\"\n        CACHE MANIFEST\n        # #{+ new Date}\n\n        CACHE:\n        index.html\n        #{relativePackageScriptPath(pkg)}\n        #{(pkg.remoteDependencies or []).join(\"\\n\")}\n\n        NETWORK:\n        https://*\n        http://*\n        *\n      \"\"\"\n\n`makeScript` returns a string representation of a script tag that has a src\nattribute.\n\n    makeScript = (src) ->\n      \"<script src=#{JSON.stringify(src)}><\\/script>\"\n\n`dependencyScripts` returns a string containing the script tags that are\nthe remote script dependencies of this build.\n\n    dependencyScripts = (remoteDependencies=[]) ->\n      remoteDependencies.map(makeScript).join(\"\\n\")\n\nJSONp Function name\n\n    jsonpFnName = ({repository}) ->\n      \"#{repository.full_name}:#{repository.branch}\"\n\nWraps the given data in a JSONP function wrapper. This allows us to host our\npackages on Github pages and get around any same origin issues by using JSONP.\n\n    jsonpWrapper = (pkg, data) ->\n      \"\"\"\n        window[\"#{jsonpFnName(pkg)}\"](#{data});\n      \"\"\"\n\nWrap code in a closure that provides the package and a require function. This\ncan be used for generating standalone HTML pages, scripts, and tests.\n\n    packageWrapper = (pkg, code) ->\n      \"\"\"\n        ;(function(PACKAGE) {\n        var oldRequire = window.Require;\n        #{PACKAGE.dependencies.require.distribution.main.content}\n        var require = Require.generateFor(PACKAGE);\n        window.Require = oldRequire;\n        #{code}\n        })(#{JSON.stringify(pkg, null, 2)});\n      \"\"\"\n\nIf our string is an absolute URL then we assume that the server is CORS enabled\nand we can make a cross origin request to collect the JSON data.\n\nWe also handle a Github repo dependency such as `STRd6/issues:master`.\nThis uses JSONP to load the package from the gh-pages branch of the given repo.\n\n`STRd6/issues:master` will be accessible at `http://strd6.github.io/issues/master.json.js`.\nThe callback is the same as the repo info string: `window[\"STRd6/issues:master\"](... DATA ...)`\n\nWhy all the madness? Github pages doesn't allow CORS right now, so we need to use\nthe JSONP hack to work around it. Because the files are static we can't allow the\nserver to generate a wrapper in response to our query string param so we need to\nwork out a unique one per file ahead of time. The `<user>/<repo>:<ref>` string is\nunique for all our packages so we use it to determine the URL and name callback.\n\n    fetchDependency = MemoizePromise (path) ->\n      if typeof path is \"string\"\n        if startsWith(path, \"http\")\n          Q($.getJSON(path))\n        else\n          if (match = path.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))\n            [callback, user, repo, branch] = match\n\n            url = \"http://#{user}.github.io/#{repo}/#{branch}.json.js\"\n\n            Q $.ajax\n              url: url\n              dataType: \"jsonp\"\n              jsonpCallback: callback\n              cache: true\n              timeout: 1900\n          else\n            reject \"\"\"\n              Failed to parse repository info string #{path}, be sure it's in the\n              form `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\n              or `STRd6/editor:v0.9.1`\n            \"\"\"\n      else\n        reject \"Can only handle url string dependencies right now\"\n\nImplementation\n--------------\n\n    Packager =\n      collectDependencies: (dependencies) ->\n        names = Object.keys(dependencies)\n\n        Q.all(names.map (name) ->\n          value = dependencies[name]\n\n          fetchDependency value\n\n        ).then (results) ->\n          bundledDependencies = {}\n\n          names.forEach (name, i) ->\n            bundledDependencies[name] = results[i][0]\n\n          return bundledDependencies\n\nCreate the standalone components of this package. An html page that loads the\nmain entry point for demonstration purposes and a json package that can be\nused as a dependency in other packages.\n\nThe html page is named `index.html` and is in the folder of the ref, or the root\nif our ref is the default branch.\n\nDocs are generated and placed in `docs` directory as a sibling to `index.html`.\n\nAn application manifest is served up as a sibling to `index.html` as well.\n\nThe `.json.js` build product is placed into the root level, as siblings to the\nfolder containing `index.html`. If this branch is the default then these build\nproducts are placed as siblings to `index.html`\n\nThe optional second argument is an array of files to be added to the final\npackage.\n\n      standAlone: (pkg, files=[]) ->\n        repository = pkg.repository\n        branch = repository.branch\n\n        if isDefault(pkg)\n          base = \"\"\n        else\n          base = \"#{branch}/\"\n\n        add = (path, content) ->\n          files.push\n            content: content\n            mode: \"100644\"\n            path: path\n            type: \"blob\"\n\n        add \"#{base}index.html\", html(pkg)\n        add \"#{base}manifest.appcache\", cacheManifest(pkg)\n\n        json = JSON.stringify(pkg, null, 2)\n\n        add jsonpScriptPath(pkg), jsonpWrapper(pkg, json)\n\n        return files\n\nGenerates a standalone page for testing the app.\n\n      testScripts: (pkg) ->\n        {distribution} = pkg\n\n        testProgram = Object.keys(distribution).filter (path) ->\n          path.match /test\\//\n        .map (testPath) ->\n          \"require('./#{testPath}')\"\n        .join \"\\n\"\n\n        \"\"\"\n          #{dependencyScripts(pkg.remoteDependencies)}\n          <script>\n            #{packageWrapper(pkg, testProgram)}\n          <\\/script>\n        \"\"\"\n\n      relativePackageScriptPath: relativePackageScriptPath\n\n    module.exports = Packager",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.5.11\"\nentryPoint: \"packager\"\nremoteDependencies: [\n  \"https://code.jquery.com/jquery-1.11.0.min.js\"\n]\ndependencies:\n  require: \"distri/require:v0.4.2\"\n  memoize_promise: \"distri/memoize_promise:v0.1.0\"\n  q: \"distri/q:v1.0.1\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/packager.coffee": {
      "path": "test/packager.coffee",
      "content": "Packager = require(\"../packager\")\n\n{dependencies} = require(\"../pixie\")\n\ndescribe \"Packager\", ->\n  describe \"building a package\", ->\n    pkg = Packager.standAlone(PACKAGE)\n    relativeScriptPath = Packager.relativePackageScriptPath(PACKAGE)\n\n    it \"should have the correct manifest links\", ->\n      manifest = pkg[1].content\n\n      assert manifest.match(///^#{relativeScriptPath}$///m)\n      assert manifest.match(/^index.html$/m)\n\n    it \"should have the correct script links\", ->\n      html = pkg[0].content\n\n      assert html.match ///src=\"#{relativeScriptPath}\"///\n\n  it \"should fail to build if a resource doesn't exist\", (done) ->\n    Packager.collectDependencies(\n      notFound: \"distri/does_not_exist:v0.0.0\"\n    ).fail ({statusText}) ->\n      assert.equal statusText, \"timeout\"\n      done()\n    .done()\n\n  it \"should be able to collect remote dependencies\", (done) ->\n    Packager.collectDependencies(dependencies)\n    .then (results) ->\n      done()\n    , (errors) ->\n      throw errors\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "packager": {
      "path": "packager",
      "content": "(function() {\n  var MemoizePromise, Packager, Q, cacheManifest, dependencyScripts, fetchDependency, html, isDefault, jsonpFnName, jsonpScriptPath, jsonpWrapper, launcherScript, makeScript, packageWrapper, reject, relativePackageScript, relativePackageScriptPath, startsWith;\n\n  Q = require(\"q\");\n\n  MemoizePromise = require(\"memoize_promise\");\n\n  jsonpScriptPath = function(_arg) {\n    var branch;\n    branch = _arg.repository.branch;\n    return \"\" + branch + \".json.js\";\n  };\n\n  isDefault = function(pkg) {\n    var branch, repository;\n    repository = pkg.repository;\n    branch = repository.branch;\n    return branch === repository.default_branch;\n  };\n\n  relativePackageScript = function(pkg) {\n    var path;\n    path = relativePackageScriptPath(pkg);\n    return \"<script src=\" + (JSON.stringify(path)) + \"><\\/script>\";\n  };\n\n  relativePackageScriptPath = function(pkg) {\n    if (isDefault(pkg)) {\n      return jsonpScriptPath(pkg);\n    } else {\n      return \"../\" + (jsonpScriptPath(pkg));\n    }\n  };\n\n  launcherScript = function(pkg) {\n    return \"<script>\\n  window[\\\"\" + (jsonpFnName(pkg)) + \"\\\"] = function(PACKAGE) {\\n    delete window[\\\"\" + (jsonpFnName(pkg)) + \"\\\"];\\n    var oldRequire = window.Require;\\n    \" + PACKAGE.dependencies.require.distribution.main.content + \";\\n    var require = Require.generateFor(PACKAGE);\\n    window.Require = oldRequire;\\n    require('./' + PACKAGE.entryPoint);\\n  };\\n<\\/script>\";\n  };\n\n  startsWith = function(string, prefix) {\n    return string.match(RegExp(\"^\" + prefix));\n  };\n\n  reject = function(message) {\n    return Q.fcall(function() {\n      throw message;\n    });\n  };\n\n  html = function(pkg) {\n    return \"<!DOCTYPE html>\\n<html manifest=\\\"manifest.appcache?\" + (+(new Date)) + \"\\\">\\n  <head>\\n    <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n    \" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n  </head>\\n  <body>\\n    \" + (launcherScript(pkg)) + \"\\n    \" + (relativePackageScript(pkg)) + \"\\n  </body>\\n</html>\";\n  };\n\n  cacheManifest = function(pkg) {\n    return \"CACHE MANIFEST\\n# \" + (+(new Date)) + \"\\n\\nCACHE:\\nindex.html\\n\" + (relativePackageScriptPath(pkg)) + \"\\n\" + ((pkg.remoteDependencies || []).join(\"\\n\")) + \"\\n\\nNETWORK:\\nhttps://*\\nhttp://*\\n*\";\n  };\n\n  makeScript = function(src) {\n    return \"<script src=\" + (JSON.stringify(src)) + \"><\\/script>\";\n  };\n\n  dependencyScripts = function(remoteDependencies) {\n    if (remoteDependencies == null) {\n      remoteDependencies = [];\n    }\n    return remoteDependencies.map(makeScript).join(\"\\n\");\n  };\n\n  jsonpFnName = function(_arg) {\n    var repository;\n    repository = _arg.repository;\n    return \"\" + repository.full_name + \":\" + repository.branch;\n  };\n\n  jsonpWrapper = function(pkg, data) {\n    return \"window[\\\"\" + (jsonpFnName(pkg)) + \"\\\"](\" + data + \");\";\n  };\n\n  packageWrapper = function(pkg, code) {\n    return \";(function(PACKAGE) {\\nvar oldRequire = window.Require;\\n\" + PACKAGE.dependencies.require.distribution.main.content + \"\\nvar require = Require.generateFor(PACKAGE);\\nwindow.Require = oldRequire;\\n\" + code + \"\\n})(\" + (JSON.stringify(pkg, null, 2)) + \");\";\n  };\n\n  fetchDependency = MemoizePromise(function(path) {\n    var branch, callback, match, repo, url, user;\n    if (typeof path === \"string\") {\n      if (startsWith(path, \"http\")) {\n        return Q($.getJSON(path));\n      } else {\n        if ((match = path.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))) {\n          callback = match[0], user = match[1], repo = match[2], branch = match[3];\n          url = \"http://\" + user + \".github.io/\" + repo + \"/\" + branch + \".json.js\";\n          return Q($.ajax({\n            url: url,\n            dataType: \"jsonp\",\n            jsonpCallback: callback,\n            cache: true,\n            timeout: 1900\n          }));\n        } else {\n          return reject(\"Failed to parse repository info string \" + path + \", be sure it's in the\\nform `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\\nor `STRd6/editor:v0.9.1`\");\n        }\n      }\n    } else {\n      return reject(\"Can only handle url string dependencies right now\");\n    }\n  });\n\n  Packager = {\n    collectDependencies: function(dependencies) {\n      var names;\n      names = Object.keys(dependencies);\n      return Q.all(names.map(function(name) {\n        var value;\n        value = dependencies[name];\n        return fetchDependency(value);\n      })).then(function(results) {\n        var bundledDependencies;\n        bundledDependencies = {};\n        names.forEach(function(name, i) {\n          return bundledDependencies[name] = results[i][0];\n        });\n        return bundledDependencies;\n      });\n    },\n    standAlone: function(pkg, files) {\n      var add, base, branch, json, repository;\n      if (files == null) {\n        files = [];\n      }\n      repository = pkg.repository;\n      branch = repository.branch;\n      if (isDefault(pkg)) {\n        base = \"\";\n      } else {\n        base = \"\" + branch + \"/\";\n      }\n      add = function(path, content) {\n        return files.push({\n          content: content,\n          mode: \"100644\",\n          path: path,\n          type: \"blob\"\n        });\n      };\n      add(\"\" + base + \"index.html\", html(pkg));\n      add(\"\" + base + \"manifest.appcache\", cacheManifest(pkg));\n      json = JSON.stringify(pkg, null, 2);\n      add(jsonpScriptPath(pkg), jsonpWrapper(pkg, json));\n      return files;\n    },\n    testScripts: function(pkg) {\n      var distribution, testProgram;\n      distribution = pkg.distribution;\n      testProgram = Object.keys(distribution).filter(function(path) {\n        return path.match(/test\\//);\n      }).map(function(testPath) {\n        return \"require('./\" + testPath + \"')\";\n      }).join(\"\\n\");\n      return \"\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n<script>\\n  \" + (packageWrapper(pkg, testProgram)) + \"\\n<\\/script>\";\n    },\n    relativePackageScriptPath: relativePackageScriptPath\n  };\n\n  module.exports = Packager;\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.5.11\",\"entryPoint\":\"packager\",\"remoteDependencies\":[\"https://code.jquery.com/jquery-1.11.0.min.js\"],\"dependencies\":{\"require\":\"distri/require:v0.4.2\",\"memoize_promise\":\"distri/memoize_promise:v0.1.0\",\"q\":\"distri/q:v1.0.1\"}};",
      "type": "blob"
    },
    "test/packager": {
      "path": "test/packager",
      "content": "(function() {\n  var Packager, dependencies;\n\n  Packager = require(\"../packager\");\n\n  dependencies = require(\"../pixie\").dependencies;\n\n  describe(\"Packager\", function() {\n    describe(\"building a package\", function() {\n      var pkg, relativeScriptPath;\n      pkg = Packager.standAlone(PACKAGE);\n      relativeScriptPath = Packager.relativePackageScriptPath(PACKAGE);\n      it(\"should have the correct manifest links\", function() {\n        var manifest;\n        manifest = pkg[1].content;\n        assert(manifest.match(RegExp(\"^\" + relativeScriptPath + \"$\", \"m\")));\n        return assert(manifest.match(/^index.html$/m));\n      });\n      return it(\"should have the correct script links\", function() {\n        var html;\n        html = pkg[0].content;\n        return assert(html.match(RegExp(\"src=\\\"\" + relativeScriptPath + \"\\\"\")));\n      });\n    });\n    it(\"should fail to build if a resource doesn't exist\", function(done) {\n      return Packager.collectDependencies({\n        notFound: \"distri/does_not_exist:v0.0.0\"\n      }).fail(function(_arg) {\n        var statusText;\n        statusText = _arg.statusText;\n        assert.equal(statusText, \"timeout\");\n        return done();\n      }).done();\n    });\n    return it(\"should be able to collect remote dependencies\", function(done) {\n      return Packager.collectDependencies(dependencies).then(function(results) {\n        return done();\n      }, function(errors) {\n        throw errors;\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "version": "0.5.11",
  "entryPoint": "packager",
  "remoteDependencies": [
    "https://code.jquery.com/jquery-1.11.0.min.js"
  ],
  "repository": {
    "branch": "q-for-deferreds",
    "default_branch": "master",
    "full_name": "distri/packager",
    "homepage": null,
    "description": "Create standalone build products for web packages",
    "html_url": "https://github.com/distri/packager",
    "url": "https://api.github.com/repos/distri/packager",
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
    },
    "memoize_promise": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "memoize_promise\n===============\n\nMemoize promises, auto-invalidating on rejected ones.\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Memoize Promise\n===============\n\n    module.exports = (fn) ->\n      cache = {}\n\n      memoized = (key) ->\n        unless cache[key]\n          cache[key] = fn.apply(this, arguments)\n\n          cache[key].fail ->\n            delete cache[key]\n\n        return cache[key]\n\n        return memoized\n",
          "mode": "100644"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.0\"\nremoteDependencies: [\n  \"https://cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q.min.js\" # Just for testing\n]\n",
          "mode": "100644"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "MemoizePromise = require \"../main\"\n\nReplay = (values) ->\n  index = -1\n\n  fn = ->\n    index += 1\n\n    return values[index]\n\ndescribe \"MemoizePromise\", ->\n  it \"should memoize promises\", (done) ->\n    called = 0\n\n    fn = MemoizePromise (v) ->\n      deferred = Q.defer()\n      \n      called += 1\n\n      deferred.resolve(v)\n\n      return deferred.promise\n\n    resolved = 0\n    \n    handler = (v) ->\n      assert.equal v, \"a\"\n      assert.equal called, 1\n      resolved += 1\n      if resolved == 2\n        done()\n\n    fn(\"a\").then handler\n    fn(\"a\").then handler\n\n  it \"should void cache on failure\", (done) ->\n    called = 0\n\n    fn = MemoizePromise (v) ->\n      deferred = Q.defer()\n\n      called += 1\n\n      deferred.reject(v)\n\n      return deferred.promise\n\n    rejected = 0\n    calledReplay = Replay [1, 2, 3]\n\n    handler = (v) ->\n      assert.equal v, \"a\"\n      assert.equal called, calledReplay()\n      rejected += 1\n      if rejected == 3\n        done()\n\n    fn(\"a\").then ->\n      assert false\n    , handler\n    .done()\n\n    setTimeout ->\n      fn(\"a\").then ->\n        assert false\n      , handler\n      .done()\n\n      setTimeout ->\n        fn(\"a\").then ->\n          assert false\n        , handler\n        .done()\n\n  it \"should cache after a failure\", (done) ->\n    called = 0\n\n    fn = MemoizePromise (v) ->\n      deferred = Q.defer()\n\n      called += 1\n\n      if called == 2\n        deferred.resolve(v)\n      else\n        deferred.reject(v)\n\n      return deferred.promise\n\n    completed = 0\n    calledReplay = Replay [1, 2, 2]\n\n    handler = (v) ->\n      assert.equal v, \"a\"\n      assert.equal called, calledReplay()\n      completed += 1\n      if completed == 3\n        done()\n\n    fn(\"a\").then ->\n      assert false\n    , handler\n    .done()\n\n    setTimeout ->\n      fn(\"a\").then(handler, -> assert false)\n      .done()\n\n      setTimeout ->\n        fn(\"a\").then(handler, -> assert false)\n        .done()\n",
          "mode": "100644"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = function(fn) {\n    var cache, memoized;\n    cache = {};\n    return memoized = function(key) {\n      if (!cache[key]) {\n        cache[key] = fn.apply(this, arguments);\n        cache[key].fail(function() {\n          return delete cache[key];\n        });\n      }\n      return cache[key];\n      return memoized;\n    };\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.0\",\"remoteDependencies\":[\"https://cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q.min.js\"]};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var MemoizePromise, Replay;\n\n  MemoizePromise = require(\"../main\");\n\n  Replay = function(values) {\n    var fn, index;\n    index = -1;\n    return fn = function() {\n      index += 1;\n      return values[index];\n    };\n  };\n\n  describe(\"MemoizePromise\", function() {\n    it(\"should memoize promises\", function(done) {\n      var called, fn, handler, resolved;\n      called = 0;\n      fn = MemoizePromise(function(v) {\n        var deferred;\n        deferred = Q.defer();\n        called += 1;\n        deferred.resolve(v);\n        return deferred.promise;\n      });\n      resolved = 0;\n      handler = function(v) {\n        assert.equal(v, \"a\");\n        assert.equal(called, 1);\n        resolved += 1;\n        if (resolved === 2) {\n          return done();\n        }\n      };\n      fn(\"a\").then(handler);\n      return fn(\"a\").then(handler);\n    });\n    it(\"should void cache on failure\", function(done) {\n      var called, calledReplay, fn, handler, rejected;\n      called = 0;\n      fn = MemoizePromise(function(v) {\n        var deferred;\n        deferred = Q.defer();\n        called += 1;\n        deferred.reject(v);\n        return deferred.promise;\n      });\n      rejected = 0;\n      calledReplay = Replay([1, 2, 3]);\n      handler = function(v) {\n        assert.equal(v, \"a\");\n        assert.equal(called, calledReplay());\n        rejected += 1;\n        if (rejected === 3) {\n          return done();\n        }\n      };\n      fn(\"a\").then(function() {\n        return assert(false);\n      }, handler).done();\n      return setTimeout(function() {\n        fn(\"a\").then(function() {\n          return assert(false);\n        }, handler).done();\n        return setTimeout(function() {\n          return fn(\"a\").then(function() {\n            return assert(false);\n          }, handler).done();\n        });\n      });\n    });\n    return it(\"should cache after a failure\", function(done) {\n      var called, calledReplay, completed, fn, handler;\n      called = 0;\n      fn = MemoizePromise(function(v) {\n        var deferred;\n        deferred = Q.defer();\n        called += 1;\n        if (called === 2) {\n          deferred.resolve(v);\n        } else {\n          deferred.reject(v);\n        }\n        return deferred.promise;\n      });\n      completed = 0;\n      calledReplay = Replay([1, 2, 2]);\n      handler = function(v) {\n        assert.equal(v, \"a\");\n        assert.equal(called, calledReplay());\n        completed += 1;\n        if (completed === 3) {\n          return done();\n        }\n      };\n      fn(\"a\").then(function() {\n        return assert(false);\n      }, handler).done();\n      return setTimeout(function() {\n        fn(\"a\").then(handler, function() {\n          return assert(false);\n        }).done();\n        return setTimeout(function() {\n          return fn(\"a\").then(handler, function() {\n            return assert(false);\n          }).done();\n        });\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.1.0",
      "entryPoint": "main",
      "remoteDependencies": [
        "https://cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q.min.js"
      ],
      "repository": {
        "branch": "v0.1.0",
        "default_branch": "master",
        "full_name": "distri/memoize_promise",
        "homepage": null,
        "description": "Memoize promises, auto-invalidating on rejected ones.",
        "html_url": "https://github.com/distri/memoize_promise",
        "url": "https://api.github.com/repos/distri/memoize_promise",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "q": {
      "source": {
        "README.md": {
          "path": "README.md",
          "content": "q\n=\n\nPackaging q for distri\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.js": {
          "path": "main.js",
          "content": "/*!\n *\n * Copyright 2009-2012 Kris Kowal under the terms of the MIT\n * license found at http://github.com/kriskowal/q/raw/master/LICENSE\n *\n * With parts by Tyler Close\n * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found\n * at http://www.opensource.org/licenses/mit-license.html\n * Forked at ref_send.js version: 2009-05-11\n *\n * With parts by Mark Miller\n * Copyright (C) 2011 Google Inc.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n */\n(function(a){if(typeof bootstrap===\"function\"){bootstrap(\"promise\",a)}else{if(typeof exports===\"object\"){module.exports=a()}else{if(typeof define===\"function\"&&define.amd){define(a)}else{if(typeof ses!==\"undefined\"){if(!ses.ok()){return}else{ses.makeQ=a}}else{Q=a()}}}}})(function(){var E=false;try{throw new Error()}catch(ah){E=!!ah.stack}var u=W();var j;var ad=function(){};var ai=(function(){var ap={task:void 0,next:null};var ao=ap;var ar=false;var al=void 0;var an=false;function e(){while(ap.next){ap=ap.next;var at=ap.task;ap.task=void 0;var au=ap.domain;if(au){ap.domain=void 0;au.enter()}try{at()}catch(av){if(an){if(au){au.exit()}setTimeout(e,0);if(au){au.enter()}throw av}else{setTimeout(function(){throw av},0)}}if(au){au.exit()}}ar=false}ai=function(at){ao=ao.next={task:at,domain:an&&process.domain,next:null};if(!ar){ar=true;al()}};if(typeof process!==\"undefined\"&&process.nextTick){an=true;al=function(){process.nextTick(e)}}else{if(typeof setImmediate===\"function\"){if(typeof window!==\"undefined\"){al=setImmediate.bind(window,e)}else{al=function(){setImmediate(e)}}}else{if(typeof MessageChannel!==\"undefined\"){var aq=new MessageChannel();aq.port1.onmessage=function(){al=am;aq.port1.onmessage=e;e()};var am=function(){aq.port2.postMessage(0)};al=function(){setTimeout(e,0);am()}}else{al=function(){setTimeout(e,0)}}}}return ai})();var a=Function.call;function p(e){return function(){return a.apply(e,arguments)}}var ab=p(Array.prototype.slice);var c=p(Array.prototype.reduce||function(an,am){var e=0,al=this.length;if(arguments.length===1){do{if(e in this){am=this[e++];break}if(++e>=al){throw new TypeError()}}while(1)}for(;e<al;e++){if(e in this){am=an(am,this[e],e)}}return am});var R=p(Array.prototype.indexOf||function(al){for(var e=0;e<this.length;e++){if(this[e]===al){return e}}return -1});var b=p(Array.prototype.map||function(an,al){var e=this;var am=[];c(e,function(aq,ap,ao){am.push(an.call(al,ap,ao,e))},void 0);return am});var H=Object.create||function(al){function e(){}e.prototype=al;return new e()};var A=p(Object.prototype.hasOwnProperty);var G=Object.keys||function(e){var am=[];for(var al in e){if(A(e,al)){am.push(al)}}return am};var ak=p(Object.prototype.toString);function V(e){return e===Object(e)}function w(e){return(ak(e)===\"[object StopIteration]\"||e instanceof I)}var I;if(typeof ReturnValue!==\"undefined\"){I=ReturnValue}else{I=function(e){this.value=e}}var Y=\"From previous event:\";function m(e,ao){if(E&&ao.stack&&typeof e===\"object\"&&e!==null&&e.stack&&e.stack.indexOf(Y)===-1){var am=[];for(var an=ao;!!an;an=an.source){if(an.stack){am.unshift(an.stack)}}am.unshift(e.stack);var al=am.join(\"\\n\"+Y+\"\\n\");e.stack=K(al)}}function K(an){var al=an.split(\"\\n\");var ao=[];for(var am=0;am<al.length;++am){var e=al[am];if(!g(e)&&!Z(e)&&e){ao.push(e)}}return ao.join(\"\\n\")}function Z(e){return e.indexOf(\"(module.js:\")!==-1||e.indexOf(\"(node.js:\")!==-1}function af(e){var an=/at .+ \\((.+):(\\d+):(?:\\d+)\\)$/.exec(e);if(an){return[an[1],Number(an[2])]}var am=/at ([^ ]+):(\\d+):(?:\\d+)$/.exec(e);if(am){return[am[1],Number(am[2])]}var al=/.*@(.+):(\\d+)$/.exec(e);if(al){return[al[1],Number(al[2])]}}function g(al){var am=af(al);if(!am){return false}var an=am[0];var e=am[1];return an===j&&e>=u&&e<=s}function W(){if(!E){return}try{throw new Error()}catch(ao){var al=ao.stack.split(\"\\n\");var am=al[0].indexOf(\"@\")>0?al[1]:al[2];var an=af(am);if(!an){return}j=an[0];return an[1]}}function C(am,e,al){return function(){if(typeof console!==\"undefined\"&&typeof console.warn===\"function\"){console.warn(e+\" is deprecated, use \"+al+\" instead.\",new Error(\"\").stack)}return am.apply(am,arguments)}}function l(e){if(y(e)){return e}if(M(e)){return L(e)}else{return z(e)}}l.resolve=l;l.nextTick=ai;l.longStackSupport=false;l.defer=h;function h(){var an=[],ap=[],ao;var al=H(h.prototype);var ar=H(N.prototype);ar.promiseDispatch=function(au,av,at){var e=ab(arguments);if(an){an.push(e);if(av===\"when\"&&at[1]){ap.push(at[1])}}else{ai(function(){ao.promiseDispatch.apply(ao,e)})}};ar.valueOf=function(){if(an){return ar}var e=J(ao);if(y(e)){ao=e}return e};ar.inspect=function(){if(!ao){return{state:\"pending\"}}return ao.inspect()};if(l.longStackSupport&&E){try{throw new Error()}catch(aq){ar.stack=aq.stack.substring(aq.stack.indexOf(\"\\n\")+1)}}function am(e){ao=e;ar.source=e;c(an,function(au,at){ai(function(){e.promiseDispatch.apply(e,at)})},void 0);an=void 0;ap=void 0}al.promise=ar;al.resolve=function(e){if(ao){return}am(l(e))};al.fulfill=function(e){if(ao){return}am(z(e))};al.reject=function(e){if(ao){return}am(D(e))};al.notify=function(e){if(ao){return}c(ap,function(au,at){ai(function(){at(e)})},void 0)};return al}h.prototype.makeNodeResolver=function(){var e=this;return function(al,am){if(al){e.reject(al)}else{if(arguments.length>2){e.resolve(ab(arguments,1))}else{e.resolve(am)}}}};l.Promise=T;l.promise=T;function T(am){if(typeof am!==\"function\"){throw new TypeError(\"resolver must be a function.\")}var e=h();try{am(e.resolve,e.reject,e.notify)}catch(al){e.reject(al)}return e.promise}T.race=n;T.all=x;T.reject=D;T.resolve=l;l.passByCopy=function(e){return e};N.prototype.passByCopy=function(){return this};l.join=function(e,al){return l(e).join(al)};N.prototype.join=function(e){return l([this,e]).spread(function(al,am){if(al===am){return al}else{throw new Error(\"Can't join: not the same: \"+al+\" \"+am)}})};l.race=n;function n(e){return T(function(ao,an){for(var am=0,al=e.length;am<al;am++){l(e[am]).then(ao,an)}})}N.prototype.race=function(){return this.then(l.race)};l.makePromise=N;function N(al,ao,an){if(ao===void 0){ao=function(ap){return D(new Error(\"Promise does not support operation: \"+ap))}}if(an===void 0){an=function(){return{state:\"unknown\"}}}var am=H(N.prototype);am.promiseDispatch=function(at,au,aq){var ap;try{if(al[au]){ap=al[au].apply(am,aq)}else{ap=ao.call(am,au,aq)}}catch(ar){ap=D(ar)}if(at){at(ap)}};am.inspect=an;if(an){var e=an();if(e.state===\"rejected\"){am.exception=e.reason}am.valueOf=function(){var ap=an();if(ap.state===\"pending\"||ap.state===\"rejected\"){return am}return ap.value}}return am}N.prototype.toString=function(){return\"[object Promise]\"};N.prototype.then=function(ao,ap,al){var aq=this;var ar=h();var am=false;function an(av){try{return typeof ao===\"function\"?ao(av):av}catch(au){return D(au)}}function at(au){if(typeof ap===\"function\"){m(au,aq);try{return ap(au)}catch(av){return D(av)}}return D(au)}function e(au){return typeof al===\"function\"?al(au):au}ai(function(){aq.promiseDispatch(function(au){if(am){return}am=true;ar.resolve(an(au))},\"when\",[function(au){if(am){return}am=true;ar.resolve(at(au))}])});aq.promiseDispatch(void 0,\"when\",[void 0,function(au){var aw;var ax=false;try{aw=e(au)}catch(av){ax=true;if(l.onerror){l.onerror(av)}else{throw av}}if(!ax){ar.notify(aw)}}]);return ar.promise};l.when=O;function O(am,e,al,an){return l(am).then(e,al,an)}N.prototype.thenResolve=function(e){return this.then(function(){return e})};l.thenResolve=function(al,e){return l(al).thenResolve(e)};N.prototype.thenReject=function(e){return this.then(function(){throw e})};l.thenReject=function(al,e){return l(al).thenReject(e)};l.nearer=J;function J(al){if(y(al)){var e=al.inspect();if(e.state===\"fulfilled\"){return e.value}}return al}l.isPromise=y;function y(e){return V(e)&&typeof e.promiseDispatch===\"function\"&&typeof e.inspect===\"function\"}l.isPromiseAlike=M;function M(e){return V(e)&&typeof e.then===\"function\"}l.isPending=ac;function ac(e){return y(e)&&e.inspect().state===\"pending\"}N.prototype.isPending=function(){return this.inspect().state===\"pending\"};l.isFulfilled=P;function P(e){return !y(e)||e.inspect().state===\"fulfilled\"}N.prototype.isFulfilled=function(){return this.inspect().state===\"fulfilled\"};l.isRejected=U;function U(e){return y(e)&&e.inspect().state===\"rejected\"}N.prototype.isRejected=function(){return this.inspect().state===\"rejected\"};var aa=[];var aj=[];var o=true;function ag(){aa.length=0;aj.length=0;if(!o){o=true}}function B(al,e){if(!o){return}aj.push(al);if(e&&typeof e.stack!==\"undefined\"){aa.push(e.stack)}else{aa.push(\"(no stack) \"+e)}}function k(al){if(!o){return}var e=R(aj,al);if(e!==-1){aj.splice(e,1);aa.splice(e,1)}}l.resetUnhandledRejections=ag;l.getUnhandledReasons=function(){return aa.slice()};l.stopUnhandledRejectionTracking=function(){ag();o=false};ag();l.reject=D;function D(al){var e=N({when:function(ao){if(ao){k(this)}return ao?ao(al):this}},function an(){return this},function am(){return{state:\"rejected\",reason:al}});B(e,al);return e}l.fulfill=z;function z(e){return N({when:function(){return e},get:function(am){return e[am]},set:function(am,an){e[am]=an},\"delete\":function(am){delete e[am]},post:function(an,am){if(an===null||an===void 0){return e.apply(void 0,am)}else{return e[an].apply(e,am)}},apply:function(an,am){return e.apply(an,am)},keys:function(){return G(e)}},void 0,function al(){return{state:\"fulfilled\",value:e}})}function L(al){var e=h();ai(function(){try{al.then(e.resolve,e.reject,e.notify)}catch(am){e.reject(am)}});return e.promise}l.master=v;function v(e){return N({isDef:function(){}},function al(an,am){return X(e,an,am)},function(){return l(e).inspect()})}l.spread=f;function f(am,e,al){return l(am).spread(e,al)}N.prototype.spread=function(e,al){return this.all().then(function(am){return e.apply(void 0,am)},al)};l.async=S;function S(e){return function(){function am(at,aq){var ap;if(typeof StopIteration===\"undefined\"){try{ap=an[at](aq)}catch(ar){return D(ar)}if(ap.done){return ap.value}else{return O(ap.value,ao,al)}}else{try{ap=an[at](aq)}catch(ar){if(w(ar)){return ar.value}else{return D(ar)}}return O(ap,ao,al)}}var an=e.apply(this,arguments);var ao=am.bind(am,\"next\");var al=am.bind(am,\"throw\");return ao()}}l.spawn=r;function r(e){l.done(l.async(e)())}l[\"return\"]=i;function i(e){throw new I(e)}l.promised=q;function q(e){return function(){return f([this,x(arguments)],function(al,am){return e.apply(al,am)})}}l.dispatch=X;function X(al,am,e){return l(al).dispatch(am,e)}N.prototype.dispatch=function(an,am){var al=this;var e=h();ai(function(){al.promiseDispatch(e.resolve,an,am)});return e.promise};l.get=function(e,al){return l(e).dispatch(\"get\",[al])};N.prototype.get=function(e){return this.dispatch(\"get\",[e])};l.set=function(e,al,am){return l(e).dispatch(\"set\",[al,am])};N.prototype.set=function(e,al){return this.dispatch(\"set\",[e,al])};l.del=l[\"delete\"]=function(e,al){return l(e).dispatch(\"delete\",[al])};N.prototype.del=N.prototype[\"delete\"]=function(e){return this.dispatch(\"delete\",[e])};l.mapply=l.post=function(am,al,e){return l(am).dispatch(\"post\",[al,e])};N.prototype.mapply=N.prototype.post=function(al,e){return this.dispatch(\"post\",[al,e])};l.send=l.mcall=l.invoke=function(al,e){return l(al).dispatch(\"post\",[e,ab(arguments,2)])};N.prototype.send=N.prototype.mcall=N.prototype.invoke=function(e){return this.dispatch(\"post\",[e,ab(arguments,1)])};l.fapply=function(al,e){return l(al).dispatch(\"apply\",[void 0,e])};N.prototype.fapply=function(e){return this.dispatch(\"apply\",[void 0,e])};l[\"try\"]=l.fcall=function(e){return l(e).dispatch(\"apply\",[void 0,ab(arguments,1)])};N.prototype.fcall=function(){return this.dispatch(\"apply\",[void 0,ab(arguments)])};l.fbind=function(al){var an=l(al);var e=ab(arguments,1);return function am(){return an.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};N.prototype.fbind=function(){var am=this;var e=ab(arguments);return function al(){return am.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};l.keys=function(e){return l(e).dispatch(\"keys\",[])};N.prototype.keys=function(){return this.dispatch(\"keys\",[])};l.all=x;function x(e){return O(e,function(an){var am=0;var al=h();c(an,function(ar,aq,ap){var ao;if(y(aq)&&(ao=aq.inspect()).state===\"fulfilled\"){an[ap]=ao.value}else{++am;O(aq,function(at){an[ap]=at;if(--am===0){al.resolve(an)}},al.reject,function(at){al.notify({index:ap,value:at})})}},void 0);if(am===0){al.resolve(an)}return al.promise})}N.prototype.all=function(){return x(this)};l.allResolved=C(d,\"allResolved\",\"allSettled\");function d(e){return O(e,function(al){al=b(al,l);return O(x(b(al,function(am){return O(am,ad,ad)})),function(){return al})})}N.prototype.allResolved=function(){return d(this)};l.allSettled=t;function t(e){return l(e).allSettled()}N.prototype.allSettled=function(){return this.then(function(e){return x(b(e,function(am){am=l(am);function al(){return am.inspect()}return am.then(al,al)}))})};l.fail=l[\"catch\"]=function(e,al){return l(e).then(void 0,al)};N.prototype.fail=N.prototype[\"catch\"]=function(e){return this.then(void 0,e)};l.progress=F;function F(e,al){return l(e).then(void 0,void 0,al)}N.prototype.progress=function(e){return this.then(void 0,void 0,e)};l.fin=l[\"finally\"]=function(e,al){return l(e)[\"finally\"](al)};N.prototype.fin=N.prototype[\"finally\"]=function(e){e=l(e);return this.then(function(al){return e.fcall().then(function(){return al})},function(al){return e.fcall().then(function(){throw al})})};l.done=function(am,e,an,al){return l(am).done(e,an,al)};N.prototype.done=function(e,an,am){var al=function(ap){ai(function(){m(ap,ao);if(l.onerror){l.onerror(ap)}else{throw ap}})};var ao=e||an||am?this.then(e,an,am):this;if(typeof process===\"object\"&&process&&process.domain){al=process.domain.bind(al)}ao.then(void 0,al)};l.timeout=function(al,e,am){return l(al).timeout(e,am)};N.prototype.timeout=function(al,am){var e=h();var an=setTimeout(function(){e.reject(new Error(am||\"Timed out after \"+al+\" ms\"))},al);this.then(function(ao){clearTimeout(an);e.resolve(ao)},function(ao){clearTimeout(an);e.reject(ao)},e.notify);return e.promise};l.delay=function(e,al){if(al===void 0){al=e;e=void 0}return l(e).delay(al)};N.prototype.delay=function(e){return this.then(function(am){var al=h();setTimeout(function(){al.resolve(am)},e);return al.promise})};l.nfapply=function(al,e){return l(al).nfapply(e)};N.prototype.nfapply=function(al){var e=h();var am=ab(al);am.push(e.makeNodeResolver());this.fapply(am).fail(e.reject);return e.promise};l.nfcall=function(al){var e=ab(arguments,1);return l(al).nfapply(e)};N.prototype.nfcall=function(){var al=ab(arguments);var e=h();al.push(e.makeNodeResolver());this.fapply(al).fail(e.reject);return e.promise};l.nfbind=l.denodeify=function(al){var e=ab(arguments,1);return function(){var an=e.concat(ab(arguments));var am=h();an.push(am.makeNodeResolver());l(al).fapply(an).fail(am.reject);return am.promise}};N.prototype.nfbind=N.prototype.denodeify=function(){var e=ab(arguments);e.unshift(this);return l.denodeify.apply(void 0,e)};l.nbind=function(am,e){var al=ab(arguments,2);return function(){var ap=al.concat(ab(arguments));var an=h();ap.push(an.makeNodeResolver());function ao(){return am.apply(e,arguments)}l(ao).fapply(ap).fail(an.reject);return an.promise}};N.prototype.nbind=function(){var e=ab(arguments,0);e.unshift(this);return l.nbind.apply(void 0,e)};l.nmapply=l.npost=function(am,al,e){return l(am).npost(al,e)};N.prototype.nmapply=N.prototype.npost=function(am,al){var an=ab(al||[]);var e=h();an.push(e.makeNodeResolver());this.dispatch(\"post\",[am,an]).fail(e.reject);return e.promise};l.nsend=l.nmcall=l.ninvoke=function(am,al){var an=ab(arguments,2);var e=h();an.push(e.makeNodeResolver());l(am).dispatch(\"post\",[al,an]).fail(e.reject);return e.promise};N.prototype.nsend=N.prototype.nmcall=N.prototype.ninvoke=function(al){var am=ab(arguments,1);var e=h();am.push(e.makeNodeResolver());this.dispatch(\"post\",[al,am]).fail(e.reject);return e.promise};l.nodeify=ae;function ae(al,e){return l(al).nodeify(e)}N.prototype.nodeify=function(e){if(e){this.then(function(al){ai(function(){e(null,al)})},function(al){ai(function(){e(al)})})}else{return this}};var s=W();return l});\n",
          "mode": "100644"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"1.0.1\"\n",
          "mode": "100644"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "Q = require \"../main\"\n\ndescribe \"q\", ->\n  it \"should be a promise library\", (done) ->\n\n    Q(\"wat\").then (value) ->\n      assert.equal value, \"wat\"\n      done()\n    .done()\n",
          "mode": "100644"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "/*!\n *\n * Copyright 2009-2012 Kris Kowal under the terms of the MIT\n * license found at http://github.com/kriskowal/q/raw/master/LICENSE\n *\n * With parts by Tyler Close\n * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found\n * at http://www.opensource.org/licenses/mit-license.html\n * Forked at ref_send.js version: 2009-05-11\n *\n * With parts by Mark Miller\n * Copyright (C) 2011 Google Inc.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n */\n(function(a){if(typeof bootstrap===\"function\"){bootstrap(\"promise\",a)}else{if(typeof exports===\"object\"){module.exports=a()}else{if(typeof define===\"function\"&&define.amd){define(a)}else{if(typeof ses!==\"undefined\"){if(!ses.ok()){return}else{ses.makeQ=a}}else{Q=a()}}}}})(function(){var E=false;try{throw new Error()}catch(ah){E=!!ah.stack}var u=W();var j;var ad=function(){};var ai=(function(){var ap={task:void 0,next:null};var ao=ap;var ar=false;var al=void 0;var an=false;function e(){while(ap.next){ap=ap.next;var at=ap.task;ap.task=void 0;var au=ap.domain;if(au){ap.domain=void 0;au.enter()}try{at()}catch(av){if(an){if(au){au.exit()}setTimeout(e,0);if(au){au.enter()}throw av}else{setTimeout(function(){throw av},0)}}if(au){au.exit()}}ar=false}ai=function(at){ao=ao.next={task:at,domain:an&&process.domain,next:null};if(!ar){ar=true;al()}};if(typeof process!==\"undefined\"&&process.nextTick){an=true;al=function(){process.nextTick(e)}}else{if(typeof setImmediate===\"function\"){if(typeof window!==\"undefined\"){al=setImmediate.bind(window,e)}else{al=function(){setImmediate(e)}}}else{if(typeof MessageChannel!==\"undefined\"){var aq=new MessageChannel();aq.port1.onmessage=function(){al=am;aq.port1.onmessage=e;e()};var am=function(){aq.port2.postMessage(0)};al=function(){setTimeout(e,0);am()}}else{al=function(){setTimeout(e,0)}}}}return ai})();var a=Function.call;function p(e){return function(){return a.apply(e,arguments)}}var ab=p(Array.prototype.slice);var c=p(Array.prototype.reduce||function(an,am){var e=0,al=this.length;if(arguments.length===1){do{if(e in this){am=this[e++];break}if(++e>=al){throw new TypeError()}}while(1)}for(;e<al;e++){if(e in this){am=an(am,this[e],e)}}return am});var R=p(Array.prototype.indexOf||function(al){for(var e=0;e<this.length;e++){if(this[e]===al){return e}}return -1});var b=p(Array.prototype.map||function(an,al){var e=this;var am=[];c(e,function(aq,ap,ao){am.push(an.call(al,ap,ao,e))},void 0);return am});var H=Object.create||function(al){function e(){}e.prototype=al;return new e()};var A=p(Object.prototype.hasOwnProperty);var G=Object.keys||function(e){var am=[];for(var al in e){if(A(e,al)){am.push(al)}}return am};var ak=p(Object.prototype.toString);function V(e){return e===Object(e)}function w(e){return(ak(e)===\"[object StopIteration]\"||e instanceof I)}var I;if(typeof ReturnValue!==\"undefined\"){I=ReturnValue}else{I=function(e){this.value=e}}var Y=\"From previous event:\";function m(e,ao){if(E&&ao.stack&&typeof e===\"object\"&&e!==null&&e.stack&&e.stack.indexOf(Y)===-1){var am=[];for(var an=ao;!!an;an=an.source){if(an.stack){am.unshift(an.stack)}}am.unshift(e.stack);var al=am.join(\"\\n\"+Y+\"\\n\");e.stack=K(al)}}function K(an){var al=an.split(\"\\n\");var ao=[];for(var am=0;am<al.length;++am){var e=al[am];if(!g(e)&&!Z(e)&&e){ao.push(e)}}return ao.join(\"\\n\")}function Z(e){return e.indexOf(\"(module.js:\")!==-1||e.indexOf(\"(node.js:\")!==-1}function af(e){var an=/at .+ \\((.+):(\\d+):(?:\\d+)\\)$/.exec(e);if(an){return[an[1],Number(an[2])]}var am=/at ([^ ]+):(\\d+):(?:\\d+)$/.exec(e);if(am){return[am[1],Number(am[2])]}var al=/.*@(.+):(\\d+)$/.exec(e);if(al){return[al[1],Number(al[2])]}}function g(al){var am=af(al);if(!am){return false}var an=am[0];var e=am[1];return an===j&&e>=u&&e<=s}function W(){if(!E){return}try{throw new Error()}catch(ao){var al=ao.stack.split(\"\\n\");var am=al[0].indexOf(\"@\")>0?al[1]:al[2];var an=af(am);if(!an){return}j=an[0];return an[1]}}function C(am,e,al){return function(){if(typeof console!==\"undefined\"&&typeof console.warn===\"function\"){console.warn(e+\" is deprecated, use \"+al+\" instead.\",new Error(\"\").stack)}return am.apply(am,arguments)}}function l(e){if(y(e)){return e}if(M(e)){return L(e)}else{return z(e)}}l.resolve=l;l.nextTick=ai;l.longStackSupport=false;l.defer=h;function h(){var an=[],ap=[],ao;var al=H(h.prototype);var ar=H(N.prototype);ar.promiseDispatch=function(au,av,at){var e=ab(arguments);if(an){an.push(e);if(av===\"when\"&&at[1]){ap.push(at[1])}}else{ai(function(){ao.promiseDispatch.apply(ao,e)})}};ar.valueOf=function(){if(an){return ar}var e=J(ao);if(y(e)){ao=e}return e};ar.inspect=function(){if(!ao){return{state:\"pending\"}}return ao.inspect()};if(l.longStackSupport&&E){try{throw new Error()}catch(aq){ar.stack=aq.stack.substring(aq.stack.indexOf(\"\\n\")+1)}}function am(e){ao=e;ar.source=e;c(an,function(au,at){ai(function(){e.promiseDispatch.apply(e,at)})},void 0);an=void 0;ap=void 0}al.promise=ar;al.resolve=function(e){if(ao){return}am(l(e))};al.fulfill=function(e){if(ao){return}am(z(e))};al.reject=function(e){if(ao){return}am(D(e))};al.notify=function(e){if(ao){return}c(ap,function(au,at){ai(function(){at(e)})},void 0)};return al}h.prototype.makeNodeResolver=function(){var e=this;return function(al,am){if(al){e.reject(al)}else{if(arguments.length>2){e.resolve(ab(arguments,1))}else{e.resolve(am)}}}};l.Promise=T;l.promise=T;function T(am){if(typeof am!==\"function\"){throw new TypeError(\"resolver must be a function.\")}var e=h();try{am(e.resolve,e.reject,e.notify)}catch(al){e.reject(al)}return e.promise}T.race=n;T.all=x;T.reject=D;T.resolve=l;l.passByCopy=function(e){return e};N.prototype.passByCopy=function(){return this};l.join=function(e,al){return l(e).join(al)};N.prototype.join=function(e){return l([this,e]).spread(function(al,am){if(al===am){return al}else{throw new Error(\"Can't join: not the same: \"+al+\" \"+am)}})};l.race=n;function n(e){return T(function(ao,an){for(var am=0,al=e.length;am<al;am++){l(e[am]).then(ao,an)}})}N.prototype.race=function(){return this.then(l.race)};l.makePromise=N;function N(al,ao,an){if(ao===void 0){ao=function(ap){return D(new Error(\"Promise does not support operation: \"+ap))}}if(an===void 0){an=function(){return{state:\"unknown\"}}}var am=H(N.prototype);am.promiseDispatch=function(at,au,aq){var ap;try{if(al[au]){ap=al[au].apply(am,aq)}else{ap=ao.call(am,au,aq)}}catch(ar){ap=D(ar)}if(at){at(ap)}};am.inspect=an;if(an){var e=an();if(e.state===\"rejected\"){am.exception=e.reason}am.valueOf=function(){var ap=an();if(ap.state===\"pending\"||ap.state===\"rejected\"){return am}return ap.value}}return am}N.prototype.toString=function(){return\"[object Promise]\"};N.prototype.then=function(ao,ap,al){var aq=this;var ar=h();var am=false;function an(av){try{return typeof ao===\"function\"?ao(av):av}catch(au){return D(au)}}function at(au){if(typeof ap===\"function\"){m(au,aq);try{return ap(au)}catch(av){return D(av)}}return D(au)}function e(au){return typeof al===\"function\"?al(au):au}ai(function(){aq.promiseDispatch(function(au){if(am){return}am=true;ar.resolve(an(au))},\"when\",[function(au){if(am){return}am=true;ar.resolve(at(au))}])});aq.promiseDispatch(void 0,\"when\",[void 0,function(au){var aw;var ax=false;try{aw=e(au)}catch(av){ax=true;if(l.onerror){l.onerror(av)}else{throw av}}if(!ax){ar.notify(aw)}}]);return ar.promise};l.when=O;function O(am,e,al,an){return l(am).then(e,al,an)}N.prototype.thenResolve=function(e){return this.then(function(){return e})};l.thenResolve=function(al,e){return l(al).thenResolve(e)};N.prototype.thenReject=function(e){return this.then(function(){throw e})};l.thenReject=function(al,e){return l(al).thenReject(e)};l.nearer=J;function J(al){if(y(al)){var e=al.inspect();if(e.state===\"fulfilled\"){return e.value}}return al}l.isPromise=y;function y(e){return V(e)&&typeof e.promiseDispatch===\"function\"&&typeof e.inspect===\"function\"}l.isPromiseAlike=M;function M(e){return V(e)&&typeof e.then===\"function\"}l.isPending=ac;function ac(e){return y(e)&&e.inspect().state===\"pending\"}N.prototype.isPending=function(){return this.inspect().state===\"pending\"};l.isFulfilled=P;function P(e){return !y(e)||e.inspect().state===\"fulfilled\"}N.prototype.isFulfilled=function(){return this.inspect().state===\"fulfilled\"};l.isRejected=U;function U(e){return y(e)&&e.inspect().state===\"rejected\"}N.prototype.isRejected=function(){return this.inspect().state===\"rejected\"};var aa=[];var aj=[];var o=true;function ag(){aa.length=0;aj.length=0;if(!o){o=true}}function B(al,e){if(!o){return}aj.push(al);if(e&&typeof e.stack!==\"undefined\"){aa.push(e.stack)}else{aa.push(\"(no stack) \"+e)}}function k(al){if(!o){return}var e=R(aj,al);if(e!==-1){aj.splice(e,1);aa.splice(e,1)}}l.resetUnhandledRejections=ag;l.getUnhandledReasons=function(){return aa.slice()};l.stopUnhandledRejectionTracking=function(){ag();o=false};ag();l.reject=D;function D(al){var e=N({when:function(ao){if(ao){k(this)}return ao?ao(al):this}},function an(){return this},function am(){return{state:\"rejected\",reason:al}});B(e,al);return e}l.fulfill=z;function z(e){return N({when:function(){return e},get:function(am){return e[am]},set:function(am,an){e[am]=an},\"delete\":function(am){delete e[am]},post:function(an,am){if(an===null||an===void 0){return e.apply(void 0,am)}else{return e[an].apply(e,am)}},apply:function(an,am){return e.apply(an,am)},keys:function(){return G(e)}},void 0,function al(){return{state:\"fulfilled\",value:e}})}function L(al){var e=h();ai(function(){try{al.then(e.resolve,e.reject,e.notify)}catch(am){e.reject(am)}});return e.promise}l.master=v;function v(e){return N({isDef:function(){}},function al(an,am){return X(e,an,am)},function(){return l(e).inspect()})}l.spread=f;function f(am,e,al){return l(am).spread(e,al)}N.prototype.spread=function(e,al){return this.all().then(function(am){return e.apply(void 0,am)},al)};l.async=S;function S(e){return function(){function am(at,aq){var ap;if(typeof StopIteration===\"undefined\"){try{ap=an[at](aq)}catch(ar){return D(ar)}if(ap.done){return ap.value}else{return O(ap.value,ao,al)}}else{try{ap=an[at](aq)}catch(ar){if(w(ar)){return ar.value}else{return D(ar)}}return O(ap,ao,al)}}var an=e.apply(this,arguments);var ao=am.bind(am,\"next\");var al=am.bind(am,\"throw\");return ao()}}l.spawn=r;function r(e){l.done(l.async(e)())}l[\"return\"]=i;function i(e){throw new I(e)}l.promised=q;function q(e){return function(){return f([this,x(arguments)],function(al,am){return e.apply(al,am)})}}l.dispatch=X;function X(al,am,e){return l(al).dispatch(am,e)}N.prototype.dispatch=function(an,am){var al=this;var e=h();ai(function(){al.promiseDispatch(e.resolve,an,am)});return e.promise};l.get=function(e,al){return l(e).dispatch(\"get\",[al])};N.prototype.get=function(e){return this.dispatch(\"get\",[e])};l.set=function(e,al,am){return l(e).dispatch(\"set\",[al,am])};N.prototype.set=function(e,al){return this.dispatch(\"set\",[e,al])};l.del=l[\"delete\"]=function(e,al){return l(e).dispatch(\"delete\",[al])};N.prototype.del=N.prototype[\"delete\"]=function(e){return this.dispatch(\"delete\",[e])};l.mapply=l.post=function(am,al,e){return l(am).dispatch(\"post\",[al,e])};N.prototype.mapply=N.prototype.post=function(al,e){return this.dispatch(\"post\",[al,e])};l.send=l.mcall=l.invoke=function(al,e){return l(al).dispatch(\"post\",[e,ab(arguments,2)])};N.prototype.send=N.prototype.mcall=N.prototype.invoke=function(e){return this.dispatch(\"post\",[e,ab(arguments,1)])};l.fapply=function(al,e){return l(al).dispatch(\"apply\",[void 0,e])};N.prototype.fapply=function(e){return this.dispatch(\"apply\",[void 0,e])};l[\"try\"]=l.fcall=function(e){return l(e).dispatch(\"apply\",[void 0,ab(arguments,1)])};N.prototype.fcall=function(){return this.dispatch(\"apply\",[void 0,ab(arguments)])};l.fbind=function(al){var an=l(al);var e=ab(arguments,1);return function am(){return an.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};N.prototype.fbind=function(){var am=this;var e=ab(arguments);return function al(){return am.dispatch(\"apply\",[this,e.concat(ab(arguments))])}};l.keys=function(e){return l(e).dispatch(\"keys\",[])};N.prototype.keys=function(){return this.dispatch(\"keys\",[])};l.all=x;function x(e){return O(e,function(an){var am=0;var al=h();c(an,function(ar,aq,ap){var ao;if(y(aq)&&(ao=aq.inspect()).state===\"fulfilled\"){an[ap]=ao.value}else{++am;O(aq,function(at){an[ap]=at;if(--am===0){al.resolve(an)}},al.reject,function(at){al.notify({index:ap,value:at})})}},void 0);if(am===0){al.resolve(an)}return al.promise})}N.prototype.all=function(){return x(this)};l.allResolved=C(d,\"allResolved\",\"allSettled\");function d(e){return O(e,function(al){al=b(al,l);return O(x(b(al,function(am){return O(am,ad,ad)})),function(){return al})})}N.prototype.allResolved=function(){return d(this)};l.allSettled=t;function t(e){return l(e).allSettled()}N.prototype.allSettled=function(){return this.then(function(e){return x(b(e,function(am){am=l(am);function al(){return am.inspect()}return am.then(al,al)}))})};l.fail=l[\"catch\"]=function(e,al){return l(e).then(void 0,al)};N.prototype.fail=N.prototype[\"catch\"]=function(e){return this.then(void 0,e)};l.progress=F;function F(e,al){return l(e).then(void 0,void 0,al)}N.prototype.progress=function(e){return this.then(void 0,void 0,e)};l.fin=l[\"finally\"]=function(e,al){return l(e)[\"finally\"](al)};N.prototype.fin=N.prototype[\"finally\"]=function(e){e=l(e);return this.then(function(al){return e.fcall().then(function(){return al})},function(al){return e.fcall().then(function(){throw al})})};l.done=function(am,e,an,al){return l(am).done(e,an,al)};N.prototype.done=function(e,an,am){var al=function(ap){ai(function(){m(ap,ao);if(l.onerror){l.onerror(ap)}else{throw ap}})};var ao=e||an||am?this.then(e,an,am):this;if(typeof process===\"object\"&&process&&process.domain){al=process.domain.bind(al)}ao.then(void 0,al)};l.timeout=function(al,e,am){return l(al).timeout(e,am)};N.prototype.timeout=function(al,am){var e=h();var an=setTimeout(function(){e.reject(new Error(am||\"Timed out after \"+al+\" ms\"))},al);this.then(function(ao){clearTimeout(an);e.resolve(ao)},function(ao){clearTimeout(an);e.reject(ao)},e.notify);return e.promise};l.delay=function(e,al){if(al===void 0){al=e;e=void 0}return l(e).delay(al)};N.prototype.delay=function(e){return this.then(function(am){var al=h();setTimeout(function(){al.resolve(am)},e);return al.promise})};l.nfapply=function(al,e){return l(al).nfapply(e)};N.prototype.nfapply=function(al){var e=h();var am=ab(al);am.push(e.makeNodeResolver());this.fapply(am).fail(e.reject);return e.promise};l.nfcall=function(al){var e=ab(arguments,1);return l(al).nfapply(e)};N.prototype.nfcall=function(){var al=ab(arguments);var e=h();al.push(e.makeNodeResolver());this.fapply(al).fail(e.reject);return e.promise};l.nfbind=l.denodeify=function(al){var e=ab(arguments,1);return function(){var an=e.concat(ab(arguments));var am=h();an.push(am.makeNodeResolver());l(al).fapply(an).fail(am.reject);return am.promise}};N.prototype.nfbind=N.prototype.denodeify=function(){var e=ab(arguments);e.unshift(this);return l.denodeify.apply(void 0,e)};l.nbind=function(am,e){var al=ab(arguments,2);return function(){var ap=al.concat(ab(arguments));var an=h();ap.push(an.makeNodeResolver());function ao(){return am.apply(e,arguments)}l(ao).fapply(ap).fail(an.reject);return an.promise}};N.prototype.nbind=function(){var e=ab(arguments,0);e.unshift(this);return l.nbind.apply(void 0,e)};l.nmapply=l.npost=function(am,al,e){return l(am).npost(al,e)};N.prototype.nmapply=N.prototype.npost=function(am,al){var an=ab(al||[]);var e=h();an.push(e.makeNodeResolver());this.dispatch(\"post\",[am,an]).fail(e.reject);return e.promise};l.nsend=l.nmcall=l.ninvoke=function(am,al){var an=ab(arguments,2);var e=h();an.push(e.makeNodeResolver());l(am).dispatch(\"post\",[al,an]).fail(e.reject);return e.promise};N.prototype.nsend=N.prototype.nmcall=N.prototype.ninvoke=function(al){var am=ab(arguments,1);var e=h();am.push(e.makeNodeResolver());this.dispatch(\"post\",[al,am]).fail(e.reject);return e.promise};l.nodeify=ae;function ae(al,e){return l(al).nodeify(e)}N.prototype.nodeify=function(e){if(e){this.then(function(al){ai(function(){e(null,al)})},function(al){ai(function(){e(al)})})}else{return this}};var s=W();return l});\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"1.0.1\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Q;\n\n  Q = require(\"../main\");\n\n  describe(\"q\", function() {\n    return it(\"should be a promise library\", function(done) {\n      return Q(\"wat\").then(function(value) {\n        assert.equal(value, \"wat\");\n        return done();\n      }).done();\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "1.0.1",
      "entryPoint": "main",
      "repository": {
        "branch": "v1.0.1",
        "default_branch": "master",
        "full_name": "distri/q",
        "homepage": null,
        "description": "Packaging q for distri",
        "html_url": "https://github.com/distri/q",
        "url": "https://api.github.com/repos/distri/q",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});