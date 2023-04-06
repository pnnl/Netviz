# Python GLM Parser

GLM parse is a python package based on a ruby script that is designed to work with [graphviz](http://www.graphviz.org/) to create graphical representations and positional coordinate information for distribution feeder networks described by the [GridLAB-D](http://www.gridlabd.org/) `.glm` file format. GLM parse was designed specifically to work with the [taxonomy feeders](http://gridlab-d.shoutwiki.com/wiki/Feeder_Taxonomy) which are part of the GridLAB-D project, though it may work with other feeder models as well.

The orignal project can be found here:
[GridLAB-D Taxonomy Feeder Graphs](https://emac.berkeley.edu/gridlabd/taxonomy_graphs/)

## Getting Started

### Setup Steps
1. Download the repo to your local system
2. Install graphviz: [graphviz download](https://graphviz.org/download/)
3. Create python virtual env `python -m venv env`
4. Activate virtual env `source env/bin/activate`(Linux or OS X) or `env\Scripts\activate.bat` (Windows)
5. Install Python dependencies `python -m pip install -r requirements.txt`

### Using the package
* Install the package with pip using
`pip install /<path to local repo folder>`

## Package Test/Examples
See the example use case in: `example_use.py`

You can use the example GLM Taxonomy files by running the following command:

`py example_use.py --input_file=examples/GC-12.47-1.glm --output_file=example_out.dot`

If you have Graphviz installed on your system you can run the following to verify the output to PDF format:
`neato example_out.dot -n -Tpdf -o example_out.pdf`

### You can run test by running local install:
`pip install .`

To run all tests run the following command in the base directory of the project:

`py -B -m unittest`

The `-B` flag prevents caching, making it easier to run repeat tests.

You can run more specific tests by specifying a folder or file

 `py -B -m unittest test/dynamic_tests/single_file/*`

 The above command will run only the dynamic tests.

 # Input/Output

 There are three file formats the parser uses, `glm`, `dot` and `json`.

 ## Glm

 Full specification for the `glm` file format can be found [here](http://gridlab-d.shoutwiki.com/wiki/Creating_GLM_Files).

Our parser focuses on parsing `glm` file to create a graph out of the input glm` file(s). To this end, we take a simplified approach to loading `glm` files, centering around loading `objects` and interpreting them as a node, edge, config or 'other'. We currently only interpret object declarations and include statements, all other lines are essentially treated as comments and will be preserved but not interpreted. 

### Include statements

Any files within an include statement will try to be loaded as `glm`, recursively, meaning that include statements in any of the included files will be parsed as well. The contents of each file is noted so that we can reconstruct each file when exporting `glm`.

### Glm Objects

The parser will interpret each `glm` object as one of four different internal objects to aid visualizing the `glm` files as a graph.

### Nodes

Nodes define vertices in the graph visualization.
The following `glm` object types are interpreted as nodes:
- Node
- Capacitor
- Substation
- Load
- Meter
- Triplex Meter
- Triplex Node
- House

### Edges

Edges define the connections between nodes. The following `glm` object types are interpreted as edges:
- Edge
- Regulator
- Fuse
- Overhead Line
- Recloser
- Switch
- Transformer
- Triplex Line
- Underground Line

### Configs

Configs do not show up when exporting to `dot` file format but will be preserved when exporting to `glm` or `json`. They are considered distinct from nodes, edges and other objects. The following `glm` object types are interpreted as configs:

- Regulator Configuration
- Line Configuration
- Transformer Configuration
- Triplex Line Configuration

### Other

All objects that do not fall into the above categories will be interpreted as an 'other' object. These objects do not show up when exporting to `dot` file format but will be preserved when exporting to `glm` or `json`.

## Object Properties

Glm object properties are separated into 2 categories, `meta_props` and `glm_props`.

### Meta-Props

These are properties of a `glm` object that influence how the object itself is interpreted. These properties often have an impact on the `dot` export as well. Some meta-props are implicitly defined in the `glm` such as `line_number` which stores the line number within a given file that the `glm` object is defined on. 

Consider the following `glm` file to help explain each property in `meta_props`:

    
    0     object house:10{
    1           parent house_parent;
    2          floorarea 2500 sf;
    3     }

The following properties are parsed as `meta_props` if they are found in `glm`:

`name`

 - Explicitly defined. This acts as the node/edge identifier when creating a graph of the power network. When an edge defines 'to' and 'from' the parser looks for objects that have 'name' set to the 'to' or 'from' values. If a node does not have a name property it will be automatically assigned the value 'NO_NAME_FOUND

 - `name` would be set to 'NO_NAME_FOUND' in the above example.

`line_number`

- This property is implicitly defined, it stores the line number that the given object starts on within its original `glm` file. 

- `line_number` would be set 0 in the above example.

`id`

- This property is implicitly defined and is equal to the string between the word '`object`' and the first curly brace. It should be noted that the current version of the parser makes no attempt to interpret the `id` in anyway.

- `id` would be set to '`house:10`' in the above example.

`obj_type`

- Implicitly defined. This property stores the object type, it is used to determine if the given object is a node, edge, config or other.

 - `obj_type` would be set to '`house`' in the above example.

`file_name`

- Implicitly defined. This property stores the name of the file where the object was originally located. This property is used to correctly reconstruct glm files when exporting `glm`.

 - If the example object came from a file called '`example.glm`' then `file_name` would be set to '`example.glm`'

`to`

- Explicitly defined. This property is used to determine one vertex in an edge object. This property doesn't exist in the above example.

`from`

- Explicitly defined. This property determines the other vertex in an edge object. This property doesn't exist in the above example.

`parent`

- This property sets the 'parent' of a node object. An edge is created between parent and child if one is not explicitly defined in the `glm`.

- `parent` would be set to '`house_parent`' in the above example.

`len`

- Explicitly defined. This property is used to determine the length of a edge object, however due to position calculations when exporting `dot`, this length value is not used to determine node positions.

- This property does not exist in the above example.

`length`

- Explicitly defined. This is a secondary naming for `len`, if both properties are present the `len` is used.

- This property does not exist in the above example.

`weight`

- Explicitly defined. This property influences how the object appears in a visualized dot file.

- This property does not exist in the above example.

`bustype`

- Explicitly defined. This property influences how the object appears in a visualized dot file.

- This property does not exist in the above example.

### Glm-Props

All properties not found within the `meta_props` section will be stored as `glm_props`. These do not impact the graph representation at all and are preserved so that the `glm` files can be reconstructed on export. Explicitly defined `meta_props` will show up both in `glm_props` and `meta_props`. Nested objects are treated as comments will not impact the graph visualization. 

---

## JSON

The parser expects a very specific format when inputting `json`, although you could manually type an input `json` file, the intended way to is to export a `glm` file to `json` and then later import that `json` file. The parser inputs and outputs `json` as an intermediary format that can be interpreted easily. 

### Example

Here is a more elaborate example `glm` file

```
// filename rm_example.glm

// modules
module network {
	acceleration_factor 1.1;
	convergence_limit 0.001;
}

//comment
object house:0 {
	type SWING;
	name "Feeder";
	V 0.5+1.5j;
}

object house:1 {
	parent node:0;
	bustype SWING;
}

object house:2 {
	test_prop test_val;
}

object overhead_line:0 {
	Y 8+0.8j;
	from node:1;
	to node:2;
}

object recorder {
	parent Feeder;
	property S;
	file feeder.txt;
	interval -1;
	limit 1000;
}
```

Here is the output when exporting `json`.

```
0   {
1       "header": {
2           "label": "Feeder feeder_name Scale: 1in = 1/Edge.LEN_SCALEft Created by 3   creator using glm2dot_python version version",
4           "fontsize": "24",
5           "node": {
6               "fontname": "Helvetica",
7               "fontcolor": "/x11/gray50",
8               "fontsize": "8",
9               "colorscheme": "accent8"
10          },
11          "edge": {
12              "colorscheme": "accent8"
13          }
14      },
15      "glm_lines": {
16        "rm_example.glm": {
17            "0": {
18                "file_name": "rm_example.glm",
19                "line_number": 0,
20                "line": "// filename rm_example.glm\n"
21            },
22            "1": {
23                "file_name": "rm_example.glm",
24                "line_number": 1,
25                "line": "\n"
26            },
27            "2": {
28                "file_name": "rm_example.glm",
29                "line_number": 2,
30                "line": "// modules\n"
31            },
32            "3": {
33                "file_name": "rm_example.glm",
34                "line_number": 3,
35                "line": "module network {\n"
36            },
37            "4": {
38                "file_name": "rm_example.glm",
39                "line_number": 4,
40                "line": "\tacceleration_factor 1.1;\n"
41            },
42            "5": {
43                "file_name": "rm_example.glm",
44                "line_number": 5,
45                "line": "\tconvergence_limit 0.001;\n"
46            },
47            "6": {
48                "file_name": "rm_example.glm",
49                "line_number": 6,
50                "line": "}\n"
51            },
52            "7": {
53                "file_name": "rm_example.glm",
54                "line_number": 7,
55                "line": "\n"
56            },
57            "8": {
58                "file_name": "rm_example.glm",
59                "line_number": 8,
60                "line": "//comment\n"
61            },
62            "14": {
63                "file_name": "rm_example.glm",
64                "line_number": 14,
65                "line": "\n"
66            },
67            "19": {
68                "file_name": "rm_example.glm",
69                "line_number": 19,
70                "line": "\n"
71             },
72             "23": {
73                 "file_name": "rm_example.glm",
74                 "line_number": 23,
75                 "line": "\n"
76             },
77             "29": {
78                 "file_name": "rm_example.glm",
79                 "line_number": 29,
80                 "line": "\n"
81             }
82         }
83     },
84     "objects": {
85         "nodes": [
86             {
87                 "dot_props": {
88                     "label": "",
89                     "xlabel": "Feeder",
90                     "shape": "house",
91                     "style": "filled",
92                     "X_pos": "468.64",
93                     "Y_pos": "124.0",
94                     "pos": "468.64,124.0!",
95                     "width": "0.15",
96                     "height": "0.15",
97                     "fillcolor": "4"
98                 },
99                 "glm_props": {
100                     "type": "SWING",
101                     "name": "\"Feeder\"",
102                     "V": "0.5+1.5j"
103                 },
104                 "meta_props": {
105                     "line_number": 9,
106                     "id": "house:0",
107                     "obj_type": "House",
108                     "file_name": "rm_example.glm",
109                     "name": "\"Feeder\"",
110                     "X_pos": "468.64",
111                     "Y_pos": "124.0"
112                 },
113                 "comments": {}
114             },
115             {
116                 "dot_props": {
117                     "label": "",
118                     "xlabel": "NO_NAME_FOUND",
119                     "shape": "house",
120                     "style": "filled",
121                     "X_pos": "519.64",
123                     "Y_pos": "52.0",
124                     "width": "0.15",
125                     "height": "0.15",
126                     "color": "6",
127                     "bustype_dot": "SWING",
128                     "pos": "519.64,52.0!",
129                     "fillcolor": "4"
130                 },
131                 "glm_props": {
132                     "parent": "node:0",
133                     "bustype": "SWING"
134                 },
135                 "meta_props": {
136                     "line_number": 15,
137                     "id": "house:1",
138                     "obj_type": "House",
139                     "file_name": "rm_example.glm",
140                     "parent": "node:0",
141                     "bustype": "SWING",
142                     "name": "NO_NAME_FOUND",
143                     "X_pos": "519.64",
144                     "Y_pos": "52.0"
145                 },
146                 "comments": {}
147                },
148             {
149                 "dot_props": {
150                     "label": "",
151                     "xlabel": "NO_NAME_FOUND",
152                     "shape": "house",
153                     "style": "filled",
154                     "X_pos": "519.64",
155                     "Y_pos": "52.0",
156                     "pos": "519.64,52.0!",
157                     "width": "0.15",
158                     "height": "0.15",
159                     "fillcolor": "4"
160                 },
161                 "glm_props": {
162                     "test_prop": "test_val"
163                 },
164                 "meta_props": {
165                     "line_number": 20,
166                     "id": "house:2",
167                     "obj_type": "House",
168                     "file_name": "rm_example.glm",
169                     "name": "NO_NAME_FOUND",
170                     "X_pos": "519.64",
171                     "Y_pos": "52.0"
172                 },
173                 "comments": {}
174             }
175         ],
176         "edges": [
177             {
178                 "dot_props": {
179                     "len": "0.25",
180                     "color": "5",
181                     "penwidth": "2"
182                 },
183                 "glm_props": {
184                     "Y": "8+0.8j",
185                     "from": "node:1",
186                     "to": "node:2"
187                 },
188                 "meta_props": {
189                     "line_number": 24,
190                     "id": "overhead_line:0",
191                     "obj_type": "OverheadLine",
192                     "file_name": "rm_example.glm",
193                     "to": "node:2",
194                     "from": "node:1",
195                     "name": "NO_NAME_FOUND"
196                 },
197                 "comments": {}
198             }
199         ],
200         "other": [
201             {
202                 "dot_props": {},
203                 "glm_props": {
204                     "parent": "Feeder",
205                     "property": "S",
206                     "file": "feeder.txt",
207                     "interval": "-1",
208                     "limit": "1000"
209                 },
210                 "meta_props": {
211                     "line_number": 30,
212                     "id": "recorder",
213                     "obj_type": "Recorder",
214                     "file_name": "rm_example.glm",
215                     "parent": "Feeder",
216                     "name": "NO_NAME_FOUND"
217                 },
218                 "comments": {}
219             }
220         ],
221         "configs": []
222     }
223 }
```

The output `json` is a pretty big file relative to the input `glm` but it can be understood by breaking it down into sections. 

At the top of the `json` file we have the header, this stores meta information about the `glm` file(s).

Directly under this on line 15 we have an object called "`glm_lines`" this object stores "non-object" lines from `glm` files. Things like empty lines, comments and non-parsed `glm` lines (like modules) get stored here. This section exists so we can reconstruct `glm` files when exporting `glm`.

Following the `glm_lines` section, on line 84, we have objects - separated into lists: `nodes`, `edges`, `other` and `configs`.

Within each object there are four sections: `dot_props`, `glm_props`, `meta_props`, `comments`.

- `dot_props` define properties that show up in dot output.

- `glm_props` and `meta_props` are described above in the [object properties](#object-properties) section.

- `comments` store anything that is not a property in an object, this is primarily in-object comments.

---
## Dot

The `dot` file format explicitly describes a graph representing the power network. The `dot` format can be read by the [graphviz](https://graphviz.readthedocs.io/en/stable/) library to produce a visualization of the network. Here is the `dot` output from the [glm example](#example) we were looking at before:

```
graph "feeder_name" {
	label="Feeder feeder_name 	Scale: 1in = 200.0ft 	Created by [unknown] 	using glm2dot_python version 0.1"; 
	fontsize="24";
	node [fontname="Helvetica", fontcolor="/x11/gray50", fontsize="8", colorscheme="accent8"];
	edge [colorscheme="accent8"];
	_Feeder [label="", xlabel="Feeder", shape="house", style="filled", X_pos="468.64", Y_pos="124.0", pos="468.64,124.0!", width="0.15", height="0.15", fillcolor="4"];
	_NO_NAME_FOUND [label="", xlabel="NO_NAME_FOUND", shape="house", style="filled", X_pos="519.64", Y_pos="52.0", width="0.15", height="0.15", color="6", bustype_dot="SWING", pos="519.64,52.0!", fillcolor="4"];
	_NO_NAME_FOUND [label="", xlabel="NO_NAME_FOUND", shape="house", style="filled", X_pos="519.64", Y_pos="52.0", pos="519.64,52.0!", width="0.15", height="0.15", fillcolor="4"];
	_node_1 -- _node_2 [len="0.25", color="5", penwidth="2"];
	_node_0 -- _NO_NAME_FOUND [len="0.25"];
}
```
Dot cannot be used as input to the parser, and is only used to create visualizations of the power network graph.


