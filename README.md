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

[Require Docs](http://distri.github.io/require/docs)
