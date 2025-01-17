from hello_world import hello_world

def test_hello_with_name():
    assert hello_world.hello("Alice") == "Hello Alice!"

def test_hello_with_empty_string():
    assert hello_world.hello("") == "Hello !"

def test_hello_with_special_characters():
    assert hello_world.hello("!@#$") == "Hello !@#$!"
          