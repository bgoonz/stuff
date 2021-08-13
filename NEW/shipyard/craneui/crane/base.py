from os import path

__crane_path = path.dirname(path.abspath(__file__))

def crane_path(path):
    return '%s/%s' % (__crane_path, path)
