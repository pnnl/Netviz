from glm_parse.glm_object import GLMObject

class GLMConfig(GLMObject):
	def list(self):
		return 'configs'

	def dot_props(self):
		return {}
	
	# Return nothing for dot
	def to_dot(self):

		return ''

class RegulatorConfiguration(GLMConfig): pass

class LineConfiguration(GLMConfig): pass

class TransformerConfiguration(GLMConfig): pass

class TriplexLineConfiguration(GLMConfig): pass