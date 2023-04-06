# The following are classes that correspond to specific types of NODE GLM objects we
# care to have in our graph.	For the most part they just override #dot_props to
# provide a different visual rendering for different types of nodes.

from glm_parse.glm_object import GLMObject
from glm_parse.grab_info_mixin import GrabInfoMixin


# Base class for all GLMObjects that are treated as nodes
# Note that "node" is an actual, instantiated object type in .glm.
# In this script, Node also serves as a generic base class for other node-like
# objects.
class Node(GLMObject):

	def list(self):
		return 'nodes'
	
	# The default Node generates properties causing it to render as a point
	# If the node is the SWING bus, it renders more visibly
	# Of course, descendants of this class can override this method to cause
	# a different rendering for different kinds of nodes
	def dot_props(self):
		p = { 'label': '',
					'xlabel': self.clean_xlabel(self['meta_props']['name']),
					'shape': 'point',
					'style': 'filled',
					'X_pos' : None,
					'Y_pos' : None
			}

		if 'bustype' in self['meta_props'].keys() and self['meta_props']['bustype'] == 'SWING':
			n = { 'shape': 'doubleoctagon', 
						'width': '0.1',
						'height': '0.1',
						'color': '6',
						'bustype_dot':self['meta_props']['bustype']}
			p = { **p, **n}


		if('X_pos' not in self['meta_props'].keys()):
			self['meta_props']['X_pos'] = "0.0"
		
		p['X_pos']  = self['meta_props']['X_pos']


			
		if('Y_pos' not in self['meta_props'].keys()):
			self['meta_props']['Y_pos'] = "0.0"
		
		p['Y_pos'] = self['meta_props']['Y_pos']
			
		p['pos'] = p['X_pos']+","+p['Y_pos']+'!'


		return p
	
	# The line of DOT code defined by a Node
	def to_dot(self):
		#set name of node if it exists(should always exist in actual glm files), else just set to id
		if("name" in self['meta_props'].keys()):
			name = self['meta_props']['name']
		else:
			name = self['meta_props']['id']
		s = self.clean_dot_name(name) + ' ['		
		dot_props = self.dot_props()
		for k, v in dot_props.items():
			if v != None:
				# TO DO: handle values (v) that have double quotes in them already
				if k == "pos" and v == "0.0,0.0!":
					pass
				elif k == "Y_pos" and v == "0.0":
					pass
				elif k == "X_pos" and v == "0.0":
					pass
				else:
					s += "{k}=\"{v}\", ".format(k = k, v = v)

		return s.strip(', ') + '];'
		
		


class Capacitor(Node):
	def dot_props(self):
		#default values
		shape = 'doublecircle'
		width = '0.2'
		height = '0.2'
		fillcolor = '1'

		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }

class Substation(Node):
	def dot_props(self):
		#default values
		shape = 'doublecircle'
		width = '0.3'
		height = '0.3'
		fillcolor = '1'

		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }

class Load(Node, GrabInfoMixin):

	def dot_props(self):

		size = self.size_from_power()

		#default values
		shape = 'square'
		width = size
		height = size
		fillcolor = '2'
		
		return { **super().dot_props(), **{'shape': shape, 'width': height, 'height': height, 'fillcolor': fillcolor} }

class Meter(Node):
	def dot_props(self):
		#default values
		shape = 'circle'
		width = '0.2'
		height = '0.2'
		fillcolor = '2'
		
		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }


class DieselDg(Node):
	def dot_props(self):
		#default values
		shape = 'circle'
		width = '0.3'
		height = '0.3'
		fillcolor = '1'
		
		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }

class Inverter(Node):
	def dot_props(self):
		#default values
		shape = 'circle'
		width = '0.2'
		height = '0.2'
		fillcolor = '2'
		
		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }

class TriplexMeter(Node, GrabInfoMixin):
	def dot_props(self):
		#default values
		shape = 'circle'
		width = '0.15'
		height = '0.15'

		groupid = self.get_groupid()
		if groupid == 'Commercial_Meter':
			fillcolor = '2'
		else:
			fillcolor = '3'
		
		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }



class TriplexNode(Node, GrabInfoMixin):
	def dot_props(self):
		size = self.size_from_power()
		
		if size == None:
			shape = 'triangle'
			fillcolor = '7'
			height = '0.15'
			width = '0.15'
		else:
			shape = 'house'
			fillcolor = '4'
			height = size
			width = size

		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }


class House(Node, GrabInfoMixin):
	def dot_props(self):
		size = self.size_from_area()
		groupid = self.get_groupid()
		
		shape = 'house'
		fillcolor = '4'
		height = '0.15'
		width = '0.15'
		if size != None:
			height = size
			width = size
			if groupid == 'Commercial':
				shape = 'invtriangle'
				fillcolor = '2'
			else:
				shape = 'house'
				fillcolor = '4'
		
		return { **super().dot_props(), **{'shape': shape, 'width': width, 'height': height, 'fillcolor': fillcolor} }


# Ignoring Recorders for now because when their parent is an edge (e.g. a
# regulator) it confuses things and you get a floating, disconnected recorder +
# fake node.
#
# I'm sure this can be fixed, but right now in the context of this script,
# children aren't linked directly to their parents so it's hard for a node to know
# when it has this problem.
#
# class Recorder(Node):
# 	def __init__(self, lines):
# 		super().__init__(lines)
# 		if self['name'] != None and self['name'] != '':
# 			self['name'] = "recorder_for_#{}".format(self['parent'])
	
# 	def dot_props(self):
# 		return { **super().dot_props(), **{'shape': 'note', 'width': '0.2', 'height': '0.2', 'fillcolor': 'yellow'} }