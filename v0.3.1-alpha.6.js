(function() {
  var Packager, cacheManifest, dependencyScripts, html, jsonpWrapper, lookupCached, makeScript, packageWrapper, program, reject;

  Packager = {
    collectDependencies: function(dependencies, cachedDependencies) {
      var names;
      if (cachedDependencies == null) {
        cachedDependencies = {};
      }
      names = Object.keys(dependencies);
      return Deferred.when(names.map(function(name) {
        var branch, cachedDependency, callback, match, repo, user, value;
        value = dependencies[name];
        if (typeof value === "string") {
          if (value.startsWith("http")) {
            return $.getJSON(value);
          } else {
            if ((match = value.match(/([^\/]*)\/([^\:]*)\:(.*)/))) {
              callback = match[0], user = match[1], repo = match[2], branch = match[3];
              user = user.toLowerCase();
              if (cachedDependency = lookupCached(cachedDependencies, "" + user + "/" + repo, branch)) {
                return [cachedDependency];
              } else {
                return $.ajax({
                  url: "http://" + user + ".github.io/" + repo + "/" + branch + ".jsonp",
                  dataType: "jsonp",
                  jsonpCallback: callback,
                  cache: true
                });
              }
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
      var add, base, branch, files, json, repository;
      repository = pkg.repository;
      branch = repository.branch;
      if (branch === repository.default_branch) {
        base = "";
      } else {
        base = "" + branch + "/";
      }
      files = [];
      add = function(path, content) {
        return files.push({
          path: path,
          content: content
        });
      };
      add("" + base + "index.html", html(pkg));
      add("" + base + "manifest.appcache", cacheManifest(pkg));
      json = JSON.stringify(pkg, null, 2);
      add("" + branch + ".js", program(pkg));
      add("" + branch + ".json", json);
      add("" + branch + ".jsonp", jsonpWrapper(repository, json));
      return files;
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

  module.exports = Packager;

  reject = function(message) {
    return Deferred().reject(message);
  };

  html = function(pkg) {
    return "<!DOCTYPE html>\n<html manifest=\"manifest.appcache?" + (+(new Date)) + "\">\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n" + (dependencyScripts(pkg.remoteDependencies)) + "\n</head>\n<body>\n<script>\n" + (packageWrapper(pkg, "require('./" + pkg.entryPoint + "')")) + "\n<\/script>\n</body>\n</html>";
  };

  cacheManifest = function(pkg) {
    return "CACHE MANIFEST\n# " + (+(new Date)) + "\n\nCACHE:\nindex.html\n" + ((pkg.remoteDependencies || []).join("\n")) + "\n\nNETWORK:\nhttps://*\nhttp://*\n*";
  };

  makeScript = function(src) {
    var script;
    script = document.createElement("script");
    script.src = src;
    return script.outerHTML;
  };

  dependencyScripts = function(remoteDependencies) {
    if (remoteDependencies == null) {
      remoteDependencies = [];
    }
    return remoteDependencies.map(makeScript).join("\n");
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

  lookupCached = function(cache, fullName, branch) {
    var name;
    name = Object.keys(cache).select(function(key) {
      var repository;
      repository = cache[key].repository;
      console.log("checking " + fullName + ":" + branch + " vs " + repository.full_name);
      return repository.full_name === fullName && repository.branch === branch;
    }).first();
    console.log(name);
    if (name) {
      return cache[name];
    }
  };

}).call(this);

//# sourceURL=packager.coffee