# some string helper functions
class GLMString(str):
	# take a string lik	e "my_class" and make it into "MyClass"
	def to_class_name(self):
		return ''.join([x.capitalize() for x in self.split('_')])
	
	# take a string like "R1-12-47-1_tm_598;" and make it into "tm598"
	# (makes node identifiers more succinct)
	def core(self):
		splits = self.split('-')
		#splits[-2] + splits[-1]
		return '_'.join(splits)