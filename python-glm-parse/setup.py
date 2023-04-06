import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="python-glm-parse",
    version="1.0",
    author="Chad Zink, John K. Neil",
    author_email="chad.zink@pnnl.gov",
    description="Parse GLM files into Python classes",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="ssh://git@stash.pnnl.gov:7999/cinder/py_glm_parse.git",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],  
    python_requires='>=3.6',
    install_requires=[
        'numpy'
    ]

)