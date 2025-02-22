from hello_world import hello

def test_hello_with_name():
    assert hello.say("Alice") == "Hello Alice!"

def test_hello_with_empty_string():
    assert hello.say("") == "Hello !"

def test_hello_with_special_characters():
    assert hello.say("!@#$") == "Hello !@#$!"
          