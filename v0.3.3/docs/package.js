(function(pkg) {
  // Expose a require for our package so scripts can access our modules
  window.require = Require.generateFor(pkg);
})({
  "version": "0.3.3",
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
    "packager.coffee.md": {
      "path": "packager.coffee.md",
      "mode": "100644",
      "content": "Packager\n========\n\nThe main responsibilities will be bundling dependencies, and creating the\npackage.\n\n    Packager =\n\nIf our string is an absolute URL then we assume that the server is CORS enabled\nand we can make a cross origin request to collect the JSON data.\n\nWe also handle a Github repo dependency. Something like `STRd6/issues:master`.\nThis uses JSONP to load the package from the gh-pages branch of the given repo.\n\n`STRd6/issues:master` will be accessible at `http://strd6.github.io/issues/master.jsonp`.\nThe callback is the same as the repo info string: `window[\"STRd6/issues:master\"](... DATA ...)`\n\nWhy all the madness? Github pages doesn't allow CORS right now, so we need to use\nthe JSONP hack to work around it. Because the files are static we can't allow the\nserver to generate a wrapper in response to our query string param so we need to\nwork out a unique one per file ahead of time. The `<user>/<repo>:<ref>` string is\nunique for all our packages so we use it to determine the URL and name callback.\n\n      collectDependencies: (dependencies, cachedDependencies={}) ->\n        names = Object.keys(dependencies)\n\n        Deferred.when(names.map (name) ->\n          value = dependencies[name]\n\n          if typeof value is \"string\"\n            if value.startsWith(\"http\")\n              $.getJSON(value)\n            else\n              if (match = value.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))\n                [callback, user, repo, branch] = match\n\n                if cachedDependency = lookupCached(cachedDependencies, \"#{user}/#{repo}\", branch)\n                  [cachedDependency]\n                else\n                  $.ajax\n                    url: \"http://#{user}.github.io/#{repo}/#{branch}.jsonp\"\n                    dataType: \"jsonp\"\n                    jsonpCallback: callback\n                    cache: true\n              else\n                reject \"\"\"\n                  Failed to parse repository info string #{value}, be sure it's in the\n                  form `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\n                  or `STRd6/editor:v0.9.1`\n                \"\"\"\n          else\n            reject \"Can only handle url string dependencies right now\"\n        ).then (results) ->\n          bundledDependencies = {}\n\n          names.each (name, i) ->\n            bundledDependencies[name] = results[i].first()\n\n          return bundledDependencies\n\nCreate the standalone components of this package. An html page that loads the\nmain entry point for demonstration purposes and a json package that can be\nused as a dependency in other packages.\n\nThe html page is named `index.html` and is in the folder of the ref, or the root\nif our ref is the default branch.\n\nDocs are generated and placed in `docs` directory as a sibling to `index.html`.\n\nAn application manifest is served up as a sibling to `index.html` as well.\n\nThe `.js`, `.json`, and `.jsonp` build products are placed into the root level,\nas siblings to the folder containing `index.html`. If this branch is the default\nthen these build products are placed as siblings to `index.html`\n\nThe optional second argument is an array of files to be added to the final\npackage.\n\n      standAlone: (pkg, files=[]) ->\n        repository = pkg.repository\n        branch = repository.branch\n\n        if branch is repository.default_branch\n          base = \"\"\n        else\n          base = \"#{branch}/\"\n\n        add = (path, content) ->\n          files.push\n            path: path\n            content: content\n\n        add \"#{base}index.html\", html(pkg)\n        add \"#{base}manifest.appcache\", cacheManifest(pkg)\n\n        json = JSON.stringify(pkg, null, 2)\n\n        add \"#{branch}.jsonp\", jsonpWrapper(repository, json)\n\n        return files\n\nGenerates a standalone page for testing the app.\n\n      testScripts: (pkg) ->\n        {distribution} = pkg\n\n        testProgram = Object.keys(distribution).select (path) ->\n          path.match /test\\//\n        .map (testPath) ->\n          \"require('./#{testPath}')\"\n        .join \"\\n\"\n\n        \"\"\"\n          #{dependencyScripts(pkg.remoteDependencies)}\n          <script>\n            #{packageWrapper(pkg, testProgram)}\n          <\\/script>\n        \"\"\"\n\n    module.exports = Packager\n\nHelpers\n-------\n\nCreate a rejected deferred with the given message.\n\n    reject = (message) ->\n      Deferred().reject(message)\n\nA standalone html page for a package.\n\n    html = (pkg) ->\n      \"\"\"\n        <!DOCTYPE html>\n        <html manifest=\"manifest.appcache?#{+new Date}\">\n        <head>\n        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n        #{dependencyScripts(pkg.remoteDependencies)}\n        </head>\n        <body>\n        <script>\n        #{packageWrapper(pkg, \"require('./#{pkg.entryPoint}')\")}\n        <\\/script>\n        </body>\n        </html>\n      \"\"\"\n\nAn HTML5 cache manifest for a package.\n\n    cacheManifest = (pkg) ->\n      \"\"\"\n        CACHE MANIFEST\n        # #{+ new Date}\n\n        CACHE:\n        index.html\n        #{(pkg.remoteDependencies or []).join(\"\\n\")}\n\n        NETWORK:\n        https://*\n        http://*\n        *\n      \"\"\"\n\n`makeScript` returns a string representation of a script tag that has a src\nattribute.\n\n    makeScript = (src) ->\n      script = document.createElement(\"script\")\n      script.src = src\n\n      return script.outerHTML\n\n`dependencyScripts` returns a string containing the script tags that are\nthe remote script dependencies of this build.\n\n    dependencyScripts = (remoteDependencies=[]) ->\n      remoteDependencies.map(makeScript).join(\"\\n\")\n\nWraps the given data in a JSONP function wrapper. This allows us to host our\npackages on Github pages and get around any same origin issues by using JSONP.\n\n    jsonpWrapper = (repository, data) ->\n      \"\"\"\n        window[\"#{repository.full_name}:#{repository.branch}\"](#{data});\n      \"\"\"\n\nWrap code in a closure that provides the package and a require function. This\ncan be used for generating standalone HTML pages, scripts, and tests.\n\n    packageWrapper = (pkg, code) ->\n      \"\"\"\n        ;(function(PACKAGE) {\n        var require = Require.generateFor(PACKAGE);\n        #{code}\n        })(#{JSON.stringify(pkg, null, 2)});\n      \"\"\"\n\nLookup a package from a cached list of packages.\n\n    lookupCached = (cache, fullName, branch) ->\n      name = Object.keys(cache).select (key) ->\n        repository = cache[key].repository\n\n        repository.full_name is fullName and repository.branch is branch\n      .first()\n\n      if name\n        cache[name]\n",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "mode": "100644",
      "content": "version: \"0.3.3\"\nentryPoint: \"packager\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n  \"http://strd6.github.io/tempest/javascripts/envweb.js\"\n  \"http://strd6.github.io/require/v0.2.2.js\"\n]\n",
      "type": "blob"
    },
    "test/packager.coffee": {
      "path": "test/packager.coffee",
      "mode": "100644",
      "content": "Packager = require(\"../packager\")\n\ndescribe \"Packager\", ->\n  it \"should exist\", ->\n    assert Packager\n\n  it \"should be able to create a standalone html page\", ->\n    assert Packager.standAlone(PACKAGE)\n",
      "type": "blob"
    }
  },
  "distribution": {
    "packager": {
      "path": "packager",
      "content": "(function() {\n  var Packager, cacheManifest, dependencyScripts, html, jsonpWrapper, lookupCached, makeScript, packageWrapper, reject;\n\n  Packager = {\n    collectDependencies: function(dependencies, cachedDependencies) {\n      var names;\n      if (cachedDependencies == null) {\n        cachedDependencies = {};\n      }\n      names = Object.keys(dependencies);\n      return Deferred.when(names.map(function(name) {\n        var branch, cachedDependency, callback, match, repo, user, value;\n        value = dependencies[name];\n        if (typeof value === \"string\") {\n          if (value.startsWith(\"http\")) {\n            return $.getJSON(value);\n          } else {\n            if ((match = value.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))) {\n              callback = match[0], user = match[1], repo = match[2], branch = match[3];\n              if (cachedDependency = lookupCached(cachedDependencies, \"\" + user + \"/\" + repo, branch)) {\n                return [cachedDependency];\n              } else {\n                return $.ajax({\n                  url: \"http://\" + user + \".github.io/\" + repo + \"/\" + branch + \".jsonp\",\n                  dataType: \"jsonp\",\n                  jsonpCallback: callback,\n                  cache: true\n                });\n              }\n            } else {\n              return reject(\"Failed to parse repository info string \" + value + \", be sure it's in the\\nform `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\\nor `STRd6/editor:v0.9.1`\");\n            }\n          }\n        } else {\n          return reject(\"Can only handle url string dependencies right now\");\n        }\n      })).then(function(results) {\n        var bundledDependencies;\n        bundledDependencies = {};\n        names.each(function(name, i) {\n          return bundledDependencies[name] = results[i].first();\n        });\n        return bundledDependencies;\n      });\n    },\n    standAlone: function(pkg, files) {\n      var add, base, branch, json, repository;\n      if (files == null) {\n        files = [];\n      }\n      repository = pkg.repository;\n      branch = repository.branch;\n      if (branch === repository.default_branch) {\n        base = \"\";\n      } else {\n        base = \"\" + branch + \"/\";\n      }\n      add = function(path, content) {\n        return files.push({\n          path: path,\n          content: content\n        });\n      };\n      add(\"\" + base + \"index.html\", html(pkg));\n      add(\"\" + base + \"manifest.appcache\", cacheManifest(pkg));\n      json = JSON.stringify(pkg, null, 2);\n      add(\"\" + branch + \".jsonp\", jsonpWrapper(repository, json));\n      return files;\n    },\n    testScripts: function(pkg) {\n      var distribution, testProgram;\n      distribution = pkg.distribution;\n      testProgram = Object.keys(distribution).select(function(path) {\n        return path.match(/test\\//);\n      }).map(function(testPath) {\n        return \"require('./\" + testPath + \"')\";\n      }).join(\"\\n\");\n      return \"\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n<script>\\n  \" + (packageWrapper(pkg, testProgram)) + \"\\n<\\/script>\";\n    }\n  };\n\n  module.exports = Packager;\n\n  reject = function(message) {\n    return Deferred().reject(message);\n  };\n\n  html = function(pkg) {\n    return \"<!DOCTYPE html>\\n<html manifest=\\\"manifest.appcache?\" + (+(new Date)) + \"\\\">\\n<head>\\n<meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n</head>\\n<body>\\n<script>\\n\" + (packageWrapper(pkg, \"require('./\" + pkg.entryPoint + \"')\")) + \"\\n<\\/script>\\n</body>\\n</html>\";\n  };\n\n  cacheManifest = function(pkg) {\n    return \"CACHE MANIFEST\\n# \" + (+(new Date)) + \"\\n\\nCACHE:\\nindex.html\\n\" + ((pkg.remoteDependencies || []).join(\"\\n\")) + \"\\n\\nNETWORK:\\nhttps://*\\nhttp://*\\n*\";\n  };\n\n  makeScript = function(src) {\n    var script;\n    script = document.createElement(\"script\");\n    script.src = src;\n    return script.outerHTML;\n  };\n\n  dependencyScripts = function(remoteDependencies) {\n    if (remoteDependencies == null) {\n      remoteDependencies = [];\n    }\n    return remoteDependencies.map(makeScript).join(\"\\n\");\n  };\n\n  jsonpWrapper = function(repository, data) {\n    return \"window[\\\"\" + repository.full_name + \":\" + repository.branch + \"\\\"](\" + data + \");\";\n  };\n\n  packageWrapper = function(pkg, code) {\n    return \";(function(PACKAGE) {\\nvar require = Require.generateFor(PACKAGE);\\n\" + code + \"\\n})(\" + (JSON.stringify(pkg, null, 2)) + \");\";\n  };\n\n  lookupCached = function(cache, fullName, branch) {\n    var name;\n    name = Object.keys(cache).select(function(key) {\n      var repository;\n      repository = cache[key].repository;\n      return repository.full_name === fullName && repository.branch === branch;\n    }).first();\n    if (name) {\n      return cache[name];\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=packager.coffee",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.3.3\",\"entryPoint\":\"packager\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\",\"http://strd6.github.io/tempest/javascripts/envweb.js\",\"http://strd6.github.io/require/v0.2.2.js\"]};",
      "type": "blob"
    },
    "test/packager": {
      "path": "test/packager",
      "content": "(function() {\n  var Packager;\n\n  Packager = require(\"../packager\");\n\n  describe(\"Packager\", function() {\n    it(\"should exist\", function() {\n      return assert(Packager);\n    });\n    return it(\"should be able to create a standalone html page\", function() {\n      return assert(Packager.standAlone(PACKAGE));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/packager.coffee",
      "type": "blob"
    }
  },
  "entryPoint": "packager",
  "dependencies": {},
  "remoteDependencies": [
    "//code.jquery.com/jquery-1.10.1.min.js",
    "http://strd6.github.io/tempest/javascripts/envweb.js",
    "http://strd6.github.io/require/v0.2.2.js"
  ],
  "progenitor": {
    "url": "http://strd6.github.io/editor/"
  },
  "repository": {
    "id": 13223375,
    "name": "packager",
    "full_name": "STRd6/packager",
    "owner": {
      "login": "STRd6",
      "id": 18894,
      "avatar_url": "https://0.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045?d=https%3A%2F%2Fidenticons.github.com%2F39df222bffe39629d904e4883eabc654.png",
      "gravatar_id": "33117162fff8a9cf50544a604f60c045",
      "url": "https://api.github.com/users/STRd6",
      "html_url": "https://github.com/STRd6",
      "followers_url": "https://api.github.com/users/STRd6/followers",
      "following_url": "https://api.github.com/users/STRd6/following{/other_user}",
      "gists_url": "https://api.github.com/users/STRd6/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/STRd6/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/STRd6/subscriptions",
      "organizations_url": "https://api.github.com/users/STRd6/orgs",
      "repos_url": "https://api.github.com/users/STRd6/repos",
      "events_url": "https://api.github.com/users/STRd6/events{/privacy}",
      "received_events_url": "https://api.github.com/users/STRd6/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/STRd6/packager",
    "description": "Create standalone build products for web packages",
    "fork": false,
    "url": "https://api.github.com/repos/STRd6/packager",
    "forks_url": "https://api.github.com/repos/STRd6/packager/forks",
    "keys_url": "https://api.github.com/repos/STRd6/packager/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/STRd6/packager/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/STRd6/packager/teams",
    "hooks_url": "https://api.github.com/repos/STRd6/packager/hooks",
    "issue_events_url": "https://api.github.com/repos/STRd6/packager/issues/events{/number}",
    "events_url": "https://api.github.com/repos/STRd6/packager/events",
    "assignees_url": "https://api.github.com/repos/STRd6/packager/assignees{/user}",
    "branches_url": "https://api.github.com/repos/STRd6/packager/branches{/branch}",
    "tags_url": "https://api.github.com/repos/STRd6/packager/tags",
    "blobs_url": "https://api.github.com/repos/STRd6/packager/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/STRd6/packager/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/STRd6/packager/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/STRd6/packager/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/STRd6/packager/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/STRd6/packager/languages",
    "stargazers_url": "https://api.github.com/repos/STRd6/packager/stargazers",
    "contributors_url": "https://api.github.com/repos/STRd6/packager/contributors",
    "subscribers_url": "https://api.github.com/repos/STRd6/packager/subscribers",
    "subscription_url": "https://api.github.com/repos/STRd6/packager/subscription",
    "commits_url": "https://api.github.com/repos/STRd6/packager/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/STRd6/packager/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/STRd6/packager/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/STRd6/packager/issues/comments/{number}",
    "contents_url": "https://api.github.com/repos/STRd6/packager/contents/{+path}",
    "compare_url": "https://api.github.com/repos/STRd6/packager/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/STRd6/packager/merges",
    "archive_url": "https://api.github.com/repos/STRd6/packager/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/STRd6/packager/downloads",
    "issues_url": "https://api.github.com/repos/STRd6/packager/issues{/number}",
    "pulls_url": "https://api.github.com/repos/STRd6/packager/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/STRd6/packager/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/STRd6/packager/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/STRd6/packager/labels{/name}",
    "created_at": "2013-09-30T18:28:31Z",
    "updated_at": "2013-10-09T03:08:34Z",
    "pushed_at": "2013-10-09T03:08:33Z",
    "git_url": "git://github.com/STRd6/packager.git",
    "ssh_url": "git@github.com:STRd6/packager.git",
    "clone_url": "https://github.com/STRd6/packager.git",
    "svn_url": "https://github.com/STRd6/packager",
    "homepage": null,
    "size": 3056,
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
    "master_branch": "master",
    "default_branch": "master",
    "permissions": {
      "admin": true,
      "push": true,
      "pull": true
    },
    "network_count": 0,
    "branch": "v0.3.3",
    "defaultBranch": "master"
  }
});