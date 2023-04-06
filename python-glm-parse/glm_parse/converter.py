import re
import inspect
import os.path
import os
import math
import json

from datetime import datetime

from numpy import append

from glm_parse.glm_string import GLMString
from glm_parse.glm_object import GLMObject
from glm_parse.glm_line import GLMLine
from glm_parse.node import *
from glm_parse.edge import *
from glm_parse.other import *
from glm_parse.glm_config import *
from glm_parse.grab_info_mixin import GrabInfoMixin
from glm_parse.grab_info_mixin import GrabInfoMixin
from glm_parse.calc_XY import setXY
from glm_parse.process_includes import process_includes

class Converter:
	VERSION = '0.1'
	parsing = False

	def __init__(self, infilename, calc_geo_pos = False, calc_pos = True, verbose = False, position_layout = ''):
		self.infilename = infilename
		self.calc_geo_pos = calc_geo_pos
		self.calc_pos = calc_pos
		self.position_layout = position_layout
		# note configs aren't used for anything currently
		self.lists = { "nodes": [], "edges": [], "dummy_edges": [], "configs": [], "other": [] }
		self.glm_lines = {}
		# Parse the file into class objects
		if(infilename[-4:] == "json"):
			self.parse_json(verbose)
		elif(infilename[-3:] == "glm"):
			in_files = process_includes(self.infilename, [])

			for in_file in in_files:
				self.parse_glm(in_file, verbose)

	# Parse the .glm input file into ruby objects
	def parse_glm(self, infile_name, verbose = False):
		infile = open(infile_name, "r" )

		try:
			self.parsing = True
			#infile = open( self.infilename, "r" )
			current_line = 0

			while True:
				line = infile.readline()
				if line == '':
					break
				if re.match('^object', line.strip()):
					# we've found a line like "object capacitor:2076 {"
					# the index is "capacitor:2076"
					index = line.split()[1].strip(';')
					line_start = current_line
					# the obj_type is "capacitor"
					obj_type = GLMString(index.split(':')[0].strip('{'))
					# gather up all the lines of input that define the current object
					# into lines
					lines = []
					max_lines = 5000 # use max int with decprement in loop, not reasonable to have 5000 lines ina  single object for GLM
					while max_lines > 0:
						classLine = infile.readline()
						current_line += 1
						if re.match('^}', classLine.strip()):
							break
						lines.append(classLine)
						max_lines -= 1
					else:
						raise Exception("Failed line parsing for {} on line {}, exceeded max line limit of 5,000.".format(obj_type, current_line))

					# see if there's a class (defined in module) that corresponds to the obj_type
					# of object we've found
					klass = None
					try:
						klass = globals()[obj_type.to_class_name()]
						if verbose:
							print( "Klass = {}".format(obj_type.to_class_name()))
					except:
						print("No class defined for {}".format(obj_type.to_class_name()))

					# first check if klass is a class obj_type object
					# make sure klass is a an ancestor of GLMObject
					if klass != None and inspect.isclass(klass) and 'GLMObject' in (k.__name__ for k in klass.mro()):
						# if there is a class corresponding to the current object obj_type,
						# instantiate it and let it initialize itself based on #lines
						if verbose:
							print( "Parsing {}".format(index))
						obj = klass(lines=lines)
						obj.set_meta_props(line_start, index, obj_type.to_class_name(), infile_name)

						# add the new object to the appropriate list (:nodes, :edges, etc.)
						# using the list prop of the class to sort the object into the proper list type
						self.lists[obj.list()].append(obj)
						# if the new object has a "parent" attribute, create and save
						# a dummy edge linking the parent to the new object
						if obj['meta_props'].get('parent') != None and 'Node' in (k.__name__ for k in klass.mro()):
							self.addDummyEdge(obj)
						

					else:
						print("Ignoring {}".format(index))

						if verbose:
							print("Ignoring {}".format(index))
				else:
					#if there is not an object just save the line
					if(infile_name not in self.glm_lines.keys()):
						self.glm_lines[infile_name] = {}

					self.glm_lines[infile_name][current_line] = GLMLine(current_line, line, infile_name)
				current_line += 1

			if self.calc_pos:
				setXY(self)
		finally:
			if infile:
				infile.close()
				self.parsing = False

	# Parse the json input file into ruby objects
	def parse_json(self, verbose = False):

		infile = None
		try:
			self.parsing = True
			infile = open( self.infilename, "r" )
			#convert json file to dictionary
			graph_dict = json.load(infile)

			self.glm_lines = graph_dict['glm_lines']
			#loop through each obj_type ex. [nodes,edges] then loop through each obj in each list, ex. [node1, node2, ...]
			objects = graph_dict['objects']
			for key in objects.keys():
				for obj_dict in objects[key]:
					obj_type = obj_dict['meta_props']['obj_type']
					klass = None
					try:
						klass = globals()[obj_type]
						if verbose:
							print( "Klass = {}".format(obj_type))
					except:
						#assert False, "No class defined for {}".format(obj_type)
						print("No class defined for {}".format(obj_type))

					if klass != None and inspect.isclass(klass) and 'GLMObject' in (k.__name__ for k in klass.mro()):
						# if there is a class corresponding to the current object type,
						# instantiate it and let it initialize itself based on #lines
						if verbose:
							print( "Parsing {}".format(obj_type))
						obj = klass(obj_dict = obj_dict)
						# add the new object to the appropriate list (:nodes, :edges, etc.)
						# using the list prop of the class to sort the object into the proper list type
						self.lists[obj.list()].append(obj)
						# if the new object has a "parent" attribute, create and save
						# a dummy edge linking the parent to the new object
						if obj['meta_props'].get('parent') != None and 'Node' in (k.__name__ for k in klass.mro()):
							self.addDummyEdge(obj)
						

					else:
						if verbose:
							print("Ignoring {}".format(obj_type))
		
			if self.calc_pos:
				setXY(self)
		finally:
			if infile:
				infile.close()
				self.parsing = False


	def to_dot(self, creator = ''):
		creator = creator if creator else '[unknown]'
		feeder_name = ""

		dotFileStr = 'graph "' + feeder_name + '" {\n'
		dotFileStr += "	label=\" {} ".format(feeder_name)
		dotFileStr += "	using glm2dot_python version {}\"; \n".format(self.VERSION)
		dotFileStr += '	fontsize="24";\n'
		dotFileStr += '	node [fontname="Helvetica", fontcolor="/x11/gray50", fontsize="8", colorscheme="accent8"];\n'
		dotFileStr += '	edge [colorscheme="accent8"];\n'
		for node in self.lists['nodes']:
			dotFileStr += '	{}\n'.format(node.to_dot())
		
		for edge in self.lists['edges']:
			dotFileStr += '	{}\n'.format(edge.to_dot())
	
		for edge in self.lists['dummy_edges']:
			dotFileStr += '	{}\n'.format(edge.to_dot())
		
		dotFileStr += '}\n'

		return dotFileStr
	
	def writeDot(self, outfilename, creator = ''):
		outfile = open(outfilename,'w')
		outfile.write(self.to_dot(creator))
		outfile.close()
	
	def to_json(self,creator = ''):
		creator = creator if creator else '[unknown]'
		feeder_name = "feeder_name"

		#feeder_name = os.path.splitext(os.path.basename(self.infilename))[0]
		
		node_list = []
		edge_list = []
		other_list = []
		config_list = []
		for node in self.lists['nodes']:
			#node.to_json returns a dictionary
			node_list.append(node.to_json())

		for edge in self.lists['edges']:
			#edge.to_json returns a dictionary
			edge_list.append(edge.to_json())

		for dummy_edge in self.lists['dummy_edges']:
			edge_list.append(dummy_edge.to_json())


		for other in self.lists['other']:
			#other.to_json returns a dictionary
			other_list.append(other.to_json())

		for config in self.lists['configs']:
			#other.to_json returns a dictionary
			config_list.append(config.to_json())

		json_data = {
    		"header" : {
        		"label" : "Feeder {fname} Scale: 1in = {scale_ft}ft Created by {created_by} using glm2dot_python version {version}".format(
            		fname  = feeder_name,
            		scale_ft = "1/Edge.LEN_SCALE",
            		created_by = "creator",
            		version = "version"
        		),
        		"fontsize" : "24",
				"node" : {"fontname" : "Helvetica", "fontcolor" : "/x11/gray50", "fontsize" : "8", "colorscheme" : "accent8"},
				"edge" : {"colorscheme" : "accent8"}
			},
			"glm_lines":self.glm_lines,
			"objects" : {
				"nodes" : node_list,
				"edges" : edge_list,
				"other" : other_list,
				"configs" : config_list
			}
		}

		return json.dumps(json_data, indent = 4)
	
	def writeJson(self, outfilename, creator = ''):
		outfile = open(outfilename,'w')
		outfile.write(self.to_json())
		outfile.close()
		
	def to_glm_dict(self,creator = ''):
		
		glm_str_dict = {}
		creator = creator if creator else '[unknown]'

		file_list = list(self.glm_lines.keys())
		
		obj_types = ['nodes', 'edges', 'other', 'configs']
		#for each obj_type get all instances of that obj in the file f and use that to check length of the file

		for obj_type in obj_types:
			for obj in self.lists[obj_type]:
				if(obj['meta_props']['file_name'] not in file_list):
					file_list.append(obj['meta_props']['file_name'])


		for f in file_list:
			obj_list = []
			#for each obj_type get all instances of that obj in the file f and use that to check length of the file

			for obj_type in obj_types:
				for obj in self.lists[obj_type]:
					if(obj['meta_props']['file_name'] == f):
						obj_list.append(obj)

			if(f in self.glm_lines.keys()):
				length = self.get_file_len(obj_list, self.glm_lines[f].keys())
			else:
				length = self.get_file_len(obj_list)


			glm_file_arr = [' '] * length * 2

			if(f in self.glm_lines.keys()):
				for line_num in self.glm_lines[f].keys():
						try:
							glm_file_arr[int(line_num)] = self.glm_lines[f][line_num]['line']
						except:
							glm_file_arr.append(self.glm_lines[f][line_num]['line'])

			glm_file_arr = self.insert_into_glm(obj_list, glm_file_arr)

			glm_str_dict[f] = "".join(glm_file_arr).strip()

		return glm_str_dict




	def to_glm(self,creator = '', one_file=True):

		glm_dict = self.to_glm_dict()
		glm_file_str = ''
		for f in glm_dict.keys():
			glm_file_str += glm_dict[f]
		return glm_file_str
	

	#TODO: make sure glm_line dict mapping includes file name
	def writeGlm(self, outfilename=None, outfoldername = 'output/', creator = ''):
		if(outfilename == None):
			glm_dict = self.to_glm_dict()
			#glm_dict is a dictionary that maps file name to a string representing the file.
			for f in glm_dict.keys():
				try:
					path = os.path.dirname(outfoldername+f)
					os.makedirs(path, exist_ok=True)
				except OSError as e:
					print(f"An error has occurred: {e}")

				outfile = open(outfoldername+f,'w')
				outfile.write(glm_dict[f])
				outfile.close()
		else:
			outfile = open(outfilename,'w')
			outfile.write(self.to_glm())
			outfile.close()

	def get_file_len(self, obj_list, all_lines = []):
		temp_arr = []
		for obj in obj_list:
			if('line_number' in obj['meta_props'].keys()):
				line_number = obj['meta_props']['line_number']

				lines = obj.to_glm().split('\n')
				for line in lines:
					temp_arr.insert(line_number, line+'\n')
					line_number += 1
		return(len(temp_arr) + len(all_lines))

	def insert_into_glm(self, obj_list, glmFileArr):
		for obj in obj_list:
			if('line_number' not in obj['meta_props'].keys()):
				line_number = -1
			else:
				line_number = obj['meta_props']['line_number']

			lines = obj.to_glm().split('\n')
			for line in lines:
				glmFileArr[line_number] = line+'\n'
				line_number += 1

		return glmFileArr

	def addDummyEdge(self, obj):
		edge_already_exists = False

		#check if edge already exists
		for e in self.lists['edges']:
			if(e['meta_props']['from'] == obj['meta_props']['parent'] and e['meta_props']['to'] == obj['meta_props']['name']):
				edge_already_exists = True

		if(not edge_already_exists):
			dummy = Edge.dummy(obj, obj['meta_props']['parent'], obj['meta_props']['name'] )
			self.lists['dummy_edges'].append(dummy)




		
		
