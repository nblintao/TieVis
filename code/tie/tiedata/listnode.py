import json
sorw = json.load(open('SorW.json','r'))
nodes = []
for dat in sorw:
	for edge in dat['data']:
		p = edge['edge'].split('_')
		if p[0] not in nodes:
			nodes.append(p[0])
		if p[1] not in nodes:
			nodes.append(p[1])
json.dump(nodes, open('nodelist.json', 'w'))
