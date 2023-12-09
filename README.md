# Limitations

* Since reStructuredText [does not have a formal specification](https://docutils.sourceforge.io/docs/dev/rst/problems.html#formal-specification), this program's behavior may deviate slightly from the reference implementation in Python's `docutils` library

* DOS/VMS options are not supported in option lists

* Table cells spanning multiple rows or columns are not supported

* Table cells can only contain inline elements (e.g. bullet lists are not parsed inside table cells)
