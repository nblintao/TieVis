import json
import math

fin = open("tieDataParallel.json", "r")
tieData = json.loads(fin.next())

def distance(v1, v2):
    res = 0
    for i in xrange(0, len(v1)):
        res += (v1[i] - v2[i]) * (v1[i] - v2[i])
    return math.sqrt(res)

dist = [[0 for col in range(len(tieData))] for row in range(len(tieData))]

for i in xrange(0, len(tieData)):
    for j in xrange(i + 1, len(tieData)):
        dist[i][j] = distance(tieData[i]["d"], tieData[j]["d"])

fout = open("distance.json", "w")
fout.write(json.dumps(dist))
fout.close()
