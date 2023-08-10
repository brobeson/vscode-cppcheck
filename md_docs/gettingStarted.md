---
title: Getting Started
layout: default
nav_order: 2
---


# Getting Started  <!-- markdownlint-disable-line single-h1 -->

## Installing CTest Lab

Install the extension through the [VS Code
marketplace](https://marketplace.visualstudio.com/items?itemName=brobeson.ctest-lab).
I recommend installing
[ms-vscode.cmake-tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools),
though it's not required. CTest Lab uses commands and settings from cmake-tools
if they're available. This allows users to configure CMake and CTest in one
place. If you do not have cmake-tools, then CTest Lab falls back to its own
settings. VS Code activates CTest Lab if it detects a _CMakeLists.txt_ file in
your workspace.  When activated, CTest Lab adds the Testing view to the main
toolbar. Open this view to interact with your tests.

## Discovering Tests

Before you can run tests, you must tell CTest Lab to look for the tests. There
are three ways to discover tests:

1. CTest Lab attempts to discover tests when it activates.
1. You can run the `Test: Refresh Tests` command from the command palette.
1. You can click the `Refresh` button in the Testing view.

Test discovery requires that you have configured your project. CTest Lab runs
the [ctest command](https://cmake.org/cmake/help/latest/manual/ctest.1.html) to
get the list of available tests. This also means that CTest Lab may not be able
to discover some tests until you build them. For example, if you use [Catch2's
catch_discover_tests()](https://github.com/catchorg/Catch2/blob/devel/docs/cmake-integration.md#automatic-test-registration)
command, the tests are not actually added to the CTest system until you build
them. If the list of tests does not look correct, try configuring and building
your project, then refresh the tests.

## Running Tests

After CTest Lab discovers your tests, you can run them in the Testing View. You
can run all your tests with one command, or run individual tests. Use the play
buttons in the Testing View to run tests.

If you have the [cmake-tools
extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools)
installed, CTest Lab can run the default build command prior to running tests.
You can disable this functionality with the
[`ctest-lab.buildBeforeRun`](settings#ctest-labbuildbeforerun) setting.  Note
that this does not affect test discovery. If you have new tests to discover, you
need to manually build and run test discovery.

When the tests start, CTest Lab activates the CTest output channel so you can
see the test output.

{: .warning }
At this time, you cannot view individual test output via the Test View. This
feature is on my roadmap, but I have not figured out how to make it work, yet.

## The Testing View

CTest Lab provides ways for you to interact with your tests in the Testing View.

<!-- prettier-ignore -->
<!--
### Test Tags

VS Code's test API provides support for test tags. Users can filter tests by tag
in the Testing view. CTest Lab checks your tests'
[`LABELS` properties](https://cmake.org/cmake/help/latest/prop_test/LABELS.html)
and adds all your labels as tags. In this example, if you filter
`@ctest-lab-tests:unit` in the VS Code Testing view, you will see `foo_test` and
`bar_test`. If you filter `@ctest-lab-tests:e2e`, you will only see
`end_to_end_test`.

```cmake
add_executable(foo_test foo_test.cpp)
add_test(NAME foo_test COMMAND foo_test)
add_executable(bar_test bar_test.cpp)
add_test(NAME bar_test COMMAND bar_test)
set_tests_properties(foo_test bar_test PROPERTIES LABELS "unit")

add_executable(end_to_end_test e2e_test.cpp)
add_test(NAME end_to_end_test COMMAND end_to_end_test)
set_tests_properties(end_to_end_test PROPERTIES LABELS "e2e")
```
-->

### Disabled Tests

CTest Lab appends "(Disabled)" to the test name in the Testing view if the a
test's
[`DISABLED` property](https://cmake.org/cmake/help/latest/prop_test/DISABLED.html)
is set to `true`.

### Skipped Tests

CTest sometimes skips a test, usually when a required resource is unavailable.
These tests show as "Not Run" in the CTest output and as failed tests in the
Test view.
