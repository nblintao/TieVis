var config = {}

config.matrixConfig = {
    geometry: {
        x: 0,
        y: 0,
        padding: 0.2,
        cellSize: 8.0
    },
    visual: {
        color: {
            field: 'nBet',
            range: {
                begin: 0,
                end: 10
            }
        },
        label: {
            field: null
        },
        attribute: {
            field: null
        }
    }
}

config.bipartiteConfig = {
    geometry: {
        x: 0,
        y: 0,
        w: 1000,
        h: 800
    }
}

config.legendConfig = {
    barHeight: 10,
    barWidth: 10
}

config.general = {

    colorMap: {
        party: {
            R : '#B30000',
            D : '#0171D0',
            ID: '#aaa',
            I : '#aaa'
        },
        sponsor_party: {
            R : '#B30000',
            D : '#0171D0',
            ID: '#aaa',
            I : '#aaa'           
        }
    },

    // colorCategory: colorbrewer.Paired[12],
    colorRamp: {
        
        RdYlBl: ['rgb(213,62,79)',
        'rgb(244,109,67)',
        'rgb(253,174,97)',
        'rgb(254,224,139)',
        'rgb(255,255,191)',
        'rgb(230,245,152)',
        'rgb(171,221,164)',
        'rgb(102,194,165)',
        'rgb(50,136,189)'].map(function(rgbstr) {return tinycolor(rgbstr)}).reverse(),

        YlGrBl: ['rgb(255,255,217)',
        'rgb(237,248,177)',
        'rgb(199,233,180)',
        'rgb(127,205,187)',
        'rgb(65,182,196)',
        'rgb(29,145,192)',
        'rgb(34,94,168)',
        'rgb(37,52,148)',
        'rgb(8,29,88)'].map(function(rgbstr) {return tinycolor(rgbstr)}),

        WhtPur: [
        '#FFFFFF',
        '#8856a7'
        ].map(function(rgbstr) {return tinycolor(rgbstr)})
    },

    fontMetrics: {
        ascend: 0.75,
        descend: -0.15
    }

};
config.edgeImpactConfig = {
    geometry : {
        w : 1360,
        h : 2000,
        padding : 80
    }
};

config.edgeFlowConfig = {
    geometry : {
        x : config.edgeImpactConfig.geometry.padding,
        y : 0.4 * config.edgeImpactConfig.geometry.h + config.edgeImpactConfig.geometry.padding / 4,
        w : config.edgeImpactConfig.geometry.w  - config.edgeImpactConfig.geometry.padding * 2,
        h : 0.35 * config.edgeImpactConfig.geometry.h - config.edgeImpactConfig.geometry.padding / 2

    }
};

config.circularConfig = {
    geometry : {
        x : config.edgeImpactConfig.geometry.padding,
        y : 0.15 * config.edgeImpactConfig.geometry.h,
        w : config.edgeFlowConfig.geometry.w,
        h : 0.25 * config.edgeImpactConfig.geometry.h,
        R : 50
    },
    triRelation:
        [
        {
            nBetL:2,
            eBetL:2,
            pairL:2
        },
        {
            nBetL:2,
            eBetL:2,
            pairL:1
        },
        {
            nBetL:1,
            eBetL:2,
            pairL:2
        },
        {
            nBetL:2,
            eBetL:1,
            pairL:2
        }
        ]

};

config.histogramConfig = {
    geometry : {
        x : config.edgeImpactConfig.geometry.padding,
        y : config.edgeImpactConfig.geometry.padding / 4,
        w : config.edgeFlowConfig.geometry.w,
        h : 0.15 * config.edgeImpactConfig.geometry.h - config.edgeImpactConfig.geometry.padding / 2
    }
}

config.degreeConfig = {
    geometry : {
        x : config.edgeImpactConfig.geometry.padding,
        y : 0.75 * config.edgeImpactConfig.geometry.h + config.edgeImpactConfig.geometry.padding / 4,
        w : config.edgeFlowConfig.geometry.w,
        h : 0.25 * config.edgeImpactConfig.geometry.h - config.edgeImpactConfig.geometry.padding / 2
    }
};

config.direct = false;

// var p = {


//     nodeAttrWidth: 8,

//     //force simulation config
//     forceSimulationTicks: 200,
//     medianIterationRounds: 50,


// p.files = {
//     citevis: 'data/infovis-citation-author_concept.json',
//     vote: 'data/bill_voter.json',
//     atlanta: 'data/legislature_bill_voter.json'
// }

// p.maxCnt = {
//     citevis: [20, 20],
//     vote: [100, 100],
//     atlanta: [50, 100]
// }

// p.attrs = {
//     citevis: ['---', '---'],
//     vote: ['subjects_top_term', 'party'],
//     atlanta: ['---', 'party']
// }

// p.attrs_excluded = ['bipartite', 'label', 'updated_at', 'topic_cluster_label', 'introduced_at', 'congress', 'number', 'status_at']

// p.mergeThre = 1.0;
// p.bundleThre = 0.5;






