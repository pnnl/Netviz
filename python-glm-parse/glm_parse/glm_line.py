class GLMLine(dict):
    def __init__(self, line_number, line, file_name):
        self['file_name'] = file_name
        self['line_number'] = line_number
        self['line'] = line
