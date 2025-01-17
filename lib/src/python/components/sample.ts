/* eslint-disable no-new */
import { Component, Project, SampleDir } from 'projen';

/**
 * Python code sample.
 */
export class PythonBasicSample extends Component {
  constructor(project: Project) {
    super(project);

    // src directory
    new SampleDir(project, 'src/hello_world', {
      files: {
        'hello_world.py': `"""Says hello to the given name."""
          def hello(name: str) -> str:
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
        'test_hello_world.py': `from hello_world import hello_world

def test_hello_with_name():
    assert hello_world.hello("Alice") == "Hello Alice!"

def test_hello_with_empty_string():
    assert hello_world.hello("") == "Hello !"

def test_hello_with_special_characters():
    assert hello_world.hello("!@#$") == "Hello !@#$!"
          `,
      },
    });
  }
}
