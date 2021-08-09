## Contributing to Nexial Automation
Nexial Automation Platform (Nexial for short) is released under the Apache 2.0 license. If you would like to contribute 
something, or simply want to hack on the code this document should help you get started.

---

### Code of Conduct
This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md). By participating, you agreed 
to uphold this code. Please report unacceptable behavior to @nexiality/nexial-dev.

---

### Using GitHub issues
We use GitHub issues to track bugs and enhancements. If you have a general usage question or inquiry, please ask as an
[enquiry issue](https://github.com/nexiality/nexial-webeasy/issues/new?template=enquiry.md).

If you are [reporting a bug](https://github.com/nexiality/nexial-webeasy/issues/new?template=bug_report.md), please help 
to speed up problem diagnosis by providing as much information as possible. Screenshots or if possible, a sample 
automation project would be very helpful.

---

### Code Conventions and Housekeeping
(_shamelessly but gratefully_ adopted in parts from [Spring Boot](https://github.com/spring-projects/spring-boot/blob/master/CONTRIBUTING.adoc))

None of these is must for a pull request, but they will certainly help. They can also be added after the original pull 
request but before a merge.

- Use the [Nexial code format conventions](#nexial-code-conventions). If you use IntelliJ IDEA, you might want to check
  out the [Working on IntelliJ](#working-on-intellij) section on how you can import Nexial code style scheme to your 
  project.
- Make sure all new `.java` files to have a simple Javadoc class comment with at least an `@author` tag identifying 
  you, and preferably at least a paragraph on what the class is for.
- Add the ASF license header comment to all new `.java` files (copy from existing files in the project).
- Add yourself as an `@author` to the `.java` files that you modify substantially (more than cosmetic changes).
- Add some Javadocs, especially when significant changes are proposed.
- A few unit tests would help a lot as well — someone has to do it.
- If no one else is using your branch, please rebase it against the current master (or other target branch in the main 
  project).
- When writing a commit message consider following 
  [these conventions](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html). If you are fixing an 
  existing issue please add `Fixes gh-XXXX` at the end of the commit message (where `XXXX` is the issue number).

---

### Nexial code conventions
Below are the code conventions uses in Nexial development. It is almost always a good idea to follow the same coding
convention.
1. Line separator: `\n` (Unix and OS X style) for all OS
2. Wrapping: 120. Line wraps at 120
3. Tab size: 4 with **whitespaces**
4. Whitespace: around keywords and operators.
   Keeping whitespace lines out method bodies can help make the code easier to scan. If blank lines are only included 
   between methods it becomes easier to see the overall structure of the class. If you find you need whitespace inside 
   your method, consider if extracting a private method might give a better result.
5. Braces: end of line
6. Comments
   Try to add javadoc for each public method and constant. Private methods shouldn’t generally need javadoc, unless it 
   provides a natural place to document unusual behavior.
7. Final
   Private members should be final whenever possible. Local variable and parameters should generally not be explicitly 
   declared as final since it adds so much noise.
8. Arrangement
   In general, we try to keep getters and setters of the same property together. Otherwise field and method arrangement
   are done in the order of public, protected and private.

---
