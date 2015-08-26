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
    for i in (1,2):
        if not data[i] in testnodelist:
            testnodelist.append(data[i])        

    edgeWaveData[timeID]['edges'].append([data[1],data[2],data[3],data[4]])
    
    # print(data)

# print(edgeWaveData)
print(len(testnodelist))
nodeNum = len(nodelist)
print(nodeNum)

details = []

for step in edgeWaveData:
    oldEdgeData = step['edges']
    newEdgeData = [[{'y':fromPoint,'x':toPoint,'i':-1,'v':0} for toPoint in range(nodeNum)]for fromPoint in range(nodeNum)]
    for impact in oldEdgeData:
        # use the abstract of individual impacacts
        impactNum = abs(int(impact[3]))
        
        if impactNum == 0:
            continue
        edge = newEdgeData[impact[0]][impact[1]]
        if edge['i'] == -1:
            edge['i'] = len(details)
            details.append([0 for i in range(nodeNum)])
        edge['v'] += impactNum
        details[edge['i']][impact[2]] += impactNum
        # print(impactNum)
    
    # remove empty edges
    newNewEdgeData = []
    for row in newEdgeData:
        newRow = []
        for edge in row:
            if edge['i'] != -1:
                newRow.append(edge)
        newNewEdgeData.append(newRow)
    step['edges'] = newNewEdgeData
    
# print(edgeWaveData)
json.dump(edgeWaveData, open('edgeWaveData.json','w'))

# print(nodelist)
json.dump(nodelist, open('nodelist.json','w'))

# print(details)
json.dump(details, open('details.json','w'))
