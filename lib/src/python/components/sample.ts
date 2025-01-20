/* eslint-disable no-new */
import { Component, Project, SampleDir } from 'projen';

/**
 * Python code sample.
 */
export class PythonBasicSample extends Component {
  constructor(project: Project) {
    super(project);

    // src directory

    // this sample will produce some formatting errors that are
    // used to exercise the use of lint-fix in the pipeline
    new SampleDir(project, 'src/hello_world', {
      files: {
        '__init__.py': '',
        'hello.py': `"""Says hello to the given name."""
def say(name: str) -> str:
              """Return a greeting message.
              Args:
                  name (str): Name to greet.
              Returns:
                  str: greeting message
              """
              return f"Hello {name}!"
          `,
        'py.typed': '',
      },
    });

    // tests directory
    new SampleDir(project, 'tests/hello_world', {
      files: {
        'test_hello_world.py': `from hello_world import hello

def test_hello_with_name():
    assert hello.say("Alice") == "Hello Alice!"

def test_hello_with_empty_string():
    assert hello.say("") == "Hello !"

def test_hello_with_special_characters():
    assert hello.say("!@#$") == "Hello !@#$!"
          `,
      },
    });
  }
}
