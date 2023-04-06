import re
import math
import sys

# GrabInfo is mixed in to the node types that scale their visual area
# based on their constant (real) power draw
# See, e.g. class Load below
class GrabInfoMixin:
	# number of output inches per W**(1/2) of load
	LOAD_SCALE = 0.002
	
	# Returs nil if this node has no real power load
	def size_from_power(self):
		pow = 0

		# note that for multi-phase loads, we just sum the real power draw
		# across the phases
		for k, v in self['glm_props'].items():
			if re.match('^(constant_)?power(_12)?', str(k)):
				clean_v = str(v).replace(' ', '')
				try:
					pow += abs(complex(clean_v))
				except:
					pow = 0
		return str(math.sqrt(pow) * self.LOAD_SCALE) if pow else None
	
	def size_from_area(self):
		area = 0

		for k, v in self['glm_props'].items():
			if re.match('^floor_area', str(k)):
				sys.stderr.write("key: " + str(k)+ "\n")
				sys.stderr.write(str(v))
				try:
					area += float(v)
				except:
					area = 5000.0

		return str(math.sqrt(area) * self.LOAD_SCALE) if area else None
	
	def get_groupid(self):
		groupid = None
		
		for k, v in self['glm_props'].items():
			if re.match('^groupid', str(k)):
				groupid = str(v)

		return groupid