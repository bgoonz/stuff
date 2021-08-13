# mlockexec

mlockexec is a very simple commandline tool for keeping files locked into
memory while running another process. This is useful if the process you
want to run depends on fast file access.

## Example usage:

    Usage: mlockexec [options]
    
    Options:
      -h, --help            show this help message and exit
      -m MEMORY, --max-memory=MEMORY
                            maximum amount of memory to lock.
      -g GLOB, --glob=GLOB  glob expression for files to lock
      -v, --verbose         Print verbose information

    mlockexec -m 1G -g large_file -- myprogram args

This will lock `large_file` into memory before executing `myprogram args`.
The file will be locked until `myprogram` exits.

The parameter `--glob` can be specified multiple times, and you can point to
specific fields or glob patterns.

If the total filesize of the files matching glob pattern exceeds the
mandatory `--max-memory` option, mlockexec will fail to run.

