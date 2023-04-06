
# The following are classes that correspond to specific types of EDGE GLM objects we
# care to have in our graph.	For the most part they just override #dot_props to
# provide a different visual rendering for different types of edges.

from glm_parse.glm_object import GLMObject

# base class for all GLMObjects that are treated as edges
class Edge(GLMObject):
	LEN_SCALE = 0.005 # DOT inches per GLM foot
	MIN_LEN = '0.25' # minimum length of any edge in DOT inches (for visibility)
	# edges with specified lengths are "weighted" heavier to ensure that graphviz
	# doesn't distort their lengths too liberally.
	WEIGHT_FOR_SPECIFIED = '5'
	
	def list(self):
		return 'edges'
	
	# create a dummy edge; for linking parents to children
	def dummy(self, _from, _to):
		e = Edge([])
		clean_from = self.clean_dot_name(_from)
		clean_to = self.clean_dot_name(_to)
		e['meta_props']['from'] = _from
		e['meta_props']['to'] = _to
		e['meta_props']['name'] = 'dummy_' + _from + "_" + _to
		e['meta_props']['dummy'] = True
		return e
	
	def dot_props(self):
		if('len' in self['meta_props'].keys()):
			p = {"len":str(max([self['meta_props']['len'], self.MIN_LEN]))}
			if('weight' in self['meta_props'].keys()):
				p['weight'] = self['meta_props']['weight']

			return p

		elif not 'length' in self['meta_props'].keys() or self['meta_props']['length'] == '' or self['meta_props']['length'] == None:
			return {"len": self.MIN_LEN}
		else:
			return {"len": str(max([str(float(self['meta_props']['length']) * self.LEN_SCALE), self.MIN_LEN])),
							"weight": self.WEIGHT_FOR_SPECIFIED }
	
	# The line of DOT code defined by an Edge
	def to_dot(self):
		s = "{fromVal} -- {toVal} [".format(
			fromVal = self.clean_dot_name(self['meta_props']['from']),
			toVal = self.clean_dot_name(self['meta_props']['to'])
		)
		for k, v in self.dot_props().items():
			s += "{key}=\"{val}\", ".format(key = k, val = v)
		return s.strip(', ') + '];'

class Regulator(Edge):
	def dot_props(self):
		color = '1:8:1'
		penwidth = '3'
		
		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }

class Fuse(Edge):
	def dot_props(self):
		color = '6'
		penwidth = '5'

		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }

class OverheadLine(Edge):
	def dot_props(self):
		color = '5'
		penwidth = '2'

		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }

class Recloser(Edge):
	def dot_props(self):
		color = '6:8:6'
		penwidth = '3'
		
		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }

class Switch(Edge):
	def dot_props(self):
		color = '4'
		penwidth = '5'
		
		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }

class Transformer(Edge):
	def dot_props(self):
		color = '1'
		penwidth = '5'
		
		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }

class TriplexLine(Edge):
	def dot_props(self):
		color = '8'
		
		return { **super().dot_props(), **{'color': color} }

class UndergroundLine(Edge):
	def dot_props(self):
		color = '7'
		penwidth = '2'
		
		return { **super().dot_props(), **{'color': color, 'penwidth': penwidth} }