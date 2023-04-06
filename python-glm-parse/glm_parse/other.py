# The following are classes correspond to objects that dont fit into the node or edge class 	


from glm_parse.glm_object import GLMObject
from glm_parse.grab_info_mixin import GrabInfoMixin


# Base class for all GLMObjects that aren't a node or edge
class OtherGLM(GLMObject):

	def list(self):
		return 'other'
	
	def dot_props(self):
		return {}
	
	# Return nothing for dot
	def to_dot(self):

		return ''

class Solar(OtherGLM):
    pass

class Recorder(OtherGLM):
    pass

class LineSpacing(OtherGLM):
    pass

class Link(OtherGLM):
    pass

class Player(OtherGLM):
    pass

class Office(OtherGLM):
    pass

#Line Conductors
class TriplexLineConductor(OtherGLM):
    pass
    
class OverheadLineConductor(OtherGLM):
    pass

class UndergroundLineConductor(OtherGLM):
    pass

class Scalar(OtherGLM):
	pass

class Climate(OtherGLM):
	pass

class MultiRecorder(OtherGLM):
	pass

class HelicsMsg(OtherGLM):
	pass

