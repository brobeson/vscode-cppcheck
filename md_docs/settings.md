---
title: Settings Reference
layout: default
nav_order: 4
---

<!-- Jekyll and Github Pages process this file into a website. Markdown lint -->
<!-- incorrectly claims the document has multiple top-level headings. I      -->
<!-- assume it confuses the Jekyll configuration above for a heading.        -->
<!-- markdownlint-disable single-h1 -->

# Settings Reference <!-- markdownlint-disable-line blanks-around-headers -->
{: .no_toc}

## List of Settings  <!-- markdownlint-disable-line blanks-around-headers -->
{: .no_toc}

- TOC
{: toc}

## `cppcheck.buildDirectory`

Type
: string

Default Value
: `${command:cmake.buildDirectory}` \| `null`

Description
: If this is not `null`, VS Code Cppcheck will pass this to Cppcheck's `-p`
  command line argument.

Example
: This will run `cppcheck -p /path/to/workspace/build`.

  ```json
  {
    "cppcheck.buildDirectory": "${workspaceFolder}/build"
  }
  ```

Added
: [Version 0.0.1]()

---

## `cppcheck.enables`

Type
: list of strings

Default Value
: `null`

Description
: A list of checks passed to Cppcheck's `--enable` command line argument.

Added
: Version 0.5.0
