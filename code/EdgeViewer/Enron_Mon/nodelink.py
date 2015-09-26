import json
tieDataParallel = json.load(open('tieDataParallel.json','r'))
nodelink = []
for edge in tieDataParallel:
	count = 0
	for imp in edge['d']:
		# if imp != 0:
		# 	count += 1
		count+=imp
	t = {'source':edge['y'],'target':edge['x'],'value':count}
	nodelink.append(t)
# print(nodelink)
json.dump(nodelink, open('nodelink.json','w'))
