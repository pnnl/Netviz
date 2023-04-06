import io
import re
from pathlib import Path

def process_includes(file_name, cur_list = []):
    cur_list.append(file_name)
    infile = open(file_name, "r")
    file_string = infile.read()
    infile.seek(0)
    while True:
        line = infile.readline()
        if line == '':
            break
        if re.match('^#include', line.strip()):
            f = line.split()[1].strip(';')
            f = f.strip('"')
            if(f not in cur_list):
                process_includes(f, cur_list)
    infile.close()
    return cur_list

def load_include(line, file_name):
    base_dir = str(Path(file_name).parent)+"\\"
    f = line.split()[1].strip(';')
    f = f.strip('"')
    file_string = open(base_dir + f, "r" ).read()
    return file_string
