import json
nodes = json.load(open('nodelist.json', 'r'))
data = json.load(open('SorW.json', 'r'))
ori_node = {'y':0, 'x':0, 'v':[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]}
out_data = []
global tot
tot = -1

def num_node(a):
	for i in range(len(nodes)):
		if a == nodes[i]:
			return i

def find_edge(a, b):
	global tot
	for i in range(len(out_data)):
		if (out_data[i]['y'] == a) & (out_data[i]['x'] == b):
			return i
	tot += 1
	out_data.append({'y':a, 'x':b, 'v':[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]})
	return tot

tim = 0
for dat in data:
	print dat['time']
	for edge in dat['data']:
		p, q = edge['edge'].split('_')
		p = num_node(p)
		q = num_node(q)
		out_data[find_edge(p, q)]['v'][tim] = edge['ste']
	tim += 1

json.dump(out_data, open('diEdgesparallel.json', 'w'))