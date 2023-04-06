from glm_parse.glm_string import GLMString

# base class for any object we care about in a .glm file
# GLMObject basically just parses lines from the input file into
# a key/value in its Hash-nature
# Child classes are expected minimally to specify a #dot_props method
# that generates a hash of the DOT properties for the object and a
# #to_dot method that returns the entire DOT file line for the object

class GLMObject(dict):
	def __init__(self, lines=None,obj_dict=None, tweak = False):
		if(lines != None):
			self.from_glm(lines,tweak)
		elif(obj_dict != None):
			self.from_json(obj_dict)
		#initialize meta props
		self.set_meta_props()


	def from_glm(self,lines,tweak = False):
		self['glm_props'] = {}
		self['comments'] = {}
		in_nested = False
		for line_num,line in enumerate(lines):
			a_prop2value = line.strip(' ;').split() if line != None else []
			
			if len(a_prop2value) > 1 and a_prop2value[0][:2] != '//' and not in_nested:
				
				#deal with spaces after initial space eg: 	floor_height 10 ft;
				a_prop2value = [a_prop2value[0], ' '.join(a_prop2value[1:])]

				prop_name = a_prop2value[0]
				# prop_val should be a GLM String for tweaking values
				prop_val = GLMString(a_prop2value[1]) if len(a_prop2value) > 1 else GLMString("")
				
				# for some properties, we want to "tweak" the value from what's in
				# the file. If we define a method with the right name (like tweak_name)
				# then it will be called to modify the property's value before continuing
				tweak_method = "tweak_" + prop_name
			
				if(prop_name == 'object'):
					in_nested = True
					self['comments'][line_num+1] = line

					#enter nested object, all props will be comments
					#print("found nested object")
					#break
				else:
					self['glm_props'][prop_name] = prop_val.strip(';')

			else:
				if(line == '}' or line == '};'):
					in_nested = False
				#line_num + 1 because the first line of the object is the declaration
				self['comments'][line_num+1] = line


	def from_json(self, obj_dict):
		for key in obj_dict.keys():
			if key == "dot_props":
				continue
			else:
				self[key] = obj_dict[key]


	def set_meta_props(self, line_number=None, id=None, obj_type=None, file_name=None):
		if('meta_props' not in self.keys()):
			self['meta_props'] = {}

		#This is called after the object has been created in glm_parse
		#Check if properties are already set, if not initialize them
		if(line_number != None or 'line_number' not in self['meta_props'].keys()):
			self['meta_props']['line_number'] = line_number
		
		if(id != None or 'id' not in self['meta_props'].keys()):
			self['meta_props']['id'] = id
		
		if(obj_type != None or 'obj_type' not in self['meta_props'].keys()):
			self['meta_props']['obj_type'] = obj_type

		if(file_name != None or 'file_name' not in self['meta_props'].keys()):
			self['meta_props']['file_name'] = file_name


		meta_prop_names = ['name', 'to', 'from', 'parent', 'len', 'length', 'weight', 'bustype']

		for prop in meta_prop_names:
			if('glm_props' in self.keys() and prop in self['glm_props'].keys()):
				#handle in line comments in such as name node:1; //this is node1	
				self['meta_props'][prop] = self['glm_props'][prop].split(";")[0]
		
		#name is mandatory
		if('name' not in self['meta_props']):
			self['meta_props']['name'] = 'NO_NAME_FOUND'


	# The line of JSON defined by the glm object
	def to_json(self):
		d = {}
		dot_props = self.dot_props()
		d["dot_props"] = dot_props
		d["glm_props"] = self['glm_props']
		d["meta_props"] = self['meta_props']
		d["comments"] = self['comments']
		return d

	def to_glm(self):
		start = "object " +str(self['meta_props']['id'])
		s = [start +' {\n']
		for k, v in self['glm_props'].items():
			if v != None:
				# TODO: handle values (v) that have double quotes in them already
				s.append("\t{} {};\n".format(k, v))

		if('comments' in self.keys()):
			for line_num in self['comments'].keys():
				s.insert(int(line_num), self['comments'][line_num])
		s.append('}')
		return ''.join(s)

	# The following tweak methods "core" node names so they are more succinct
	# (see the String helper methods above)
	# If you prefer the full-length node names, just comment these out!
	'''
	def tweak_name(self, n):
		return self.clean_str(n.core())
	
	def tweak_to(self, t):
		return self.clean_str(t.core())
	
	def tweak_from(self, f):
		return self.clean_str(f.core())
	
	def tweak_parent(self, p):
		return self.clean_str(p.core())
	'''

	def clean_str(self, str):
		return str.strip('"').replace('"','\\"').replace('-','_').replace('.','_').replace('~','_')

	def clean_xlabel(self, str):
		return str.strip('"').replace('"','_').replace('-','_').replace('.','_').replace('~','_')

	def clean_dot_name(self, str):
		return "_"+str.strip('"').replace('"','_').replace('-','_').replace('.','_').replace('~','_').replace(':','_')