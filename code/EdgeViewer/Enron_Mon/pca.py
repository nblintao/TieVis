import json
tieDataParallel = json.load(open('tieDataParallel.json','r'))
rawData = []
for edge in tieDataParallel:
	rawData.append(edge['d'])

import numpy as np
from sklearn.decomposition import PCA

X = np.array(rawData)
pca = PCA(n_components=2)
pcaResult = pca.fit_transform(X)
pcaResult = pcaResult.tolist()

# print(pcaResult)
json.dump(pcaResult, open('pcaResult.json','w'))
