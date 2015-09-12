import json
fin = open('impact.txt','r')

timelist = []
testnodelist = []
nodelist = []
edgeWaveData = []
for line in fin:
    data = line.split()
    timeName = data[0]
    if not timeName in timelist:
        timeID = len(timelist)
        timelist.append(data[0])
        edgeWaveData.append({'timeID':timeID,'timeName':timeName,'edges':[]})
    else:
        timeID = timelist.index(timeName)

    for i in (1,2,3):
        if not data[i] in nodelist:
            nodelist.append(data[i])
        data[i] = nodelist.index(data[i])
    
    # testing: couting the nodes in edges
    # for i in (1,2):
    #     if not data[i] in testnodelist:
    #         testnodelist.append(data[i])        

    edgeWaveData[timeID]['edges'].append([data[1],data[2],data[3],data[4]])
    
    # print(data)

# print(edgeWaveData)
print(len(testnodelist))
nodeNum = len(nodelist)
print(nodeNum)

lTimelist = len(timelist)

# details = []

tieData = [[{'y':fromPoint,'x':toPoint,'d':[0 for haha in range(lTimelist)]} for toPoint in range(nodeNum)]for fromPoint in range(nodeNum)]

for step in range(lTimelist):
    oldEdgeData = edgeWaveData[step]['edges']
    # newEdgeData = [[{'y':fromPoint,'x':toPoint,'i':-1,'v':0} for toPoint in range(nodeNum)]for fromPoint in range(nodeNum)]
    for impact in oldEdgeData:
        # use the abstract of individual impacacts
        impactNum = int(impact[3])
        impactNumAb = abs(impactNum)
        # print(tieData[impact[0]][impact[1]])
        tieData[impact[0]][impact[1]]['d'][step] += impactNumAb


def IsAllEmpty(lin):
    for t in lin:
        if t!=0:
            return False
    return True

# Remove edges that have never exist

# V1: Mark with -1
# for fromPoint in tieData:
#     for edge in fromPoint:
#         if IsAllEmpty(edge['d']):
#             edge['d'] = -1

# V2: Real Deletion
finalTieData = [[] for fromPoint in range(nodeNum)]
for i in range(nodeNum):
    for j in range(nodeNum):
        if not IsAllEmpty(tieData[i][j]['d']):
            finalTieData[i].append(tieData[i][j])

# print(finalTieData)
json.dump(finalTieData, open('tieData.json','w'))

# print(nodelist)
json.dump(nodelist, open('nodelist.json','w'))

# print(timelist)
json.dump(timelist, open('timelist.json','w'))

