(function() {
  var Packager, dependencyScripts, jsonpWrapper, makeScript, packageWrapper, program, reject;

  Packager = function() {
    return {
      collectDependencies: function(dependencies) {
        var names;
        names = Object.keys(dependencies);
        return Deferred.when(names.map(function(name) {
          var branch, callback, match, repo, user, value;
          value = dependencies[name];
          if (typeof value === "string") {
            if (value.startsWith("http")) {
              return $.getJSON(value);
            } else {
              if ((match = value.match(/([^\/]*)\/([^\:]*)\:(.*)/))) {
                callback = match[0], user = match[1], repo = match[2], branch = match[3];
                user = user.toLowerCase();
                return $.ajax({
                  url: "http://" + user + ".github.io/" + repo + "/" + branch + ".jsonp",
                  dataType: "jsonp",
                  jsonpCallback: callback,
                  cache: true
                });
              } else {
                return reject("Failed to parse repository info string " + value + ", be sure it's in the\nform `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\nor `STRd6/editor:v0.9.1`");
              }
            }
          } else {
            return reject("Can only handle url string dependencies right now");
          }
        })).then(function(results) {
          var bundledDependencies;
          bundledDependencies = {};
          names.each(function(name, i) {
            return bundledDependencies[name] = results[i].first();
          });
          return bundledDependencies;
        });
      },
      standAlone: function(pkg) {
        var distribution, entryPoint, html, json, source;
        source = pkg.source, distribution = pkg.distribution, entryPoint = pkg.entryPoint;
        html = "<!doctype html>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n" + (dependencyScripts(pkg.remoteDependencies)) + "\n</head>\n<body>\n<script>\n" + (packageWrapper(pkg, "require('./" + entryPoint + "')")) + "\n<\/script>\n</body>\n</html>";
        json = JSON.stringify(pkg, null, 2);
        return {
          html: html,
          js: program(pkg),
          json: json,
          jsonp: jsonpWrapper(pkg.repository, json)
        };
      },
      testScripts: function(pkg) {
        var distribution, testProgram;
        distribution = pkg.distribution;
        testProgram = Object.keys(distribution).select(function(path) {
          return path.match(/test\//);
        }).map(function(testPath) {
          return "require('./" + testPath + "')";
        }).join("\n");
        return "" + (dependencyScripts(pkg.remoteDependencies)) + "\n<script>\n  " + (packageWrapper(pkg, testProgram)) + "\n<\/script>";
      }
    };
  };

  module.exports = Packager;

  reject = function(message) {
    return Deferred().reject([message]);
  };

  makeScript = function(attrs) {
    return $("<script>", attrs).prop('outerHTML');
  };

  dependencyScripts = function(remoteDependencies) {
    if (remoteDependencies == null) {
      remoteDependencies = [];
    }
    return remoteDependencies.map(function(src) {
      return makeScript({
        "class": "env",
        src: src
      });
    }).join("\n");
  };

  program = function(_arg) {
    var distribution, entryPoint, main;
    distribution = _arg.distribution, entryPoint = _arg.entryPoint;
    if (main = distribution[entryPoint]) {
      return main.content;
    } else {
      console.warn("Entry point " + entryPoint + " not found.");
      return "";
    }
  };

  jsonpWrapper = function(repository, data) {
    return "window[\"" + repository.full_name + ":" + repository.branch + "\"](" + data + ");";
  };

  packageWrapper = function(pkg, code) {
    return ";(function(PACKAGE) {\nvar require = Require.generateFor(PACKAGE);\n" + code + "\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
  };

}).call(this);
