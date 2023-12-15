# Limitations

* Since reStructuredText [does not have a formal specification](https://docutils.sourceforge.io/docs/dev/rst/problems.html#formal-specification), this program's behavior may deviate slightly from the reference implementation in Python's `docutils` library

* This program will throw errors instead of emitting warnings if it encounters invalid syntax or fails semantic validation

* Only spaces can be used for indentation

* DOS/VMS options are not supported in option lists
