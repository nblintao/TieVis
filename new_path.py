day = '12-17'
# '12-17','12-18','12-19','12-20','12-21','12-22'

__author__ = "Tao LIN (nblintao@126.com)"

from pyspark import SparkContext, SparkConf
appName = 'new_path'
conf = SparkConf().setAppName(appName).setMaster('spark://10.76.6.118:7077').set("spark.speculation", "true")
sc = SparkContext(conf=conf)

# part = '71'
# from pyspark.sql import *
# sqlContext = SQLContext(sc)

import datetime
def parse(line):
    try:
        # data = line.split(',')
        d={}
        # raw data
        data = line.split(';')
        assert len(data) == 6
        d['time'] = datetime.datetime.strptime(data[0],"%Y-%m-%d %H:%M:%S.%f")
        # d['city'] = data[1]
        # d['move_indicator'] = float(data[2])>0
        d['uid'] = data[3]
        # assert(int(d['uid'])%50==0)
        # assert(d['uid'][-2:]==part)
        d['location_area'] = data[4]
        d['cell'] = data[5]
        assert(int(data[4])!=0)
        assert(int(data[5])!=0)
        return [d]
    except:
        return []

def cal_path(reco):
    try:
        rt = str(reco[0])
        s = sorted(reco[1], key=(lambda x:x['time']))
        last_line = 0
        for line in s:
            try:
                if last_line == 0 or last_line['location_area'] != line['location_area'] or last_line['cell'] != line['cell']:
                    rt += ' ' + line['time'].strftime("%Y-%m-%d %H:%M:%S.%f")[:-4] + ' ' + line['location_area'] + ' ' + line['cell']
                last_line = line
            except:
                continue
        return [str(rt)]
    except:
        return []


# def depingpong_cal_path(reco):
#     try:
#         rt = str(reco[0])
#         s = sorted(reco[1], key=(lambda x:x['time']))
#         last_line = 0
#         last_last_line = 0
#         for line in s:
#             try:
#                 if last_line == 0 or last_line['location_area'] != line['location_area'] or last_line['cell'] != line['cell']:
#                     if last_last_line == 0 or last_last_line['location_area'] != line['location_area'] or last_last_line['cell'] != line['cell']: 
#                         rt += ' ' + line['time'].strftime("%Y-%m-%d %H:%M:%S.%f")[:-4] + ' ' + line['location_area'] + ' ' + line['cell']
#                         last_last_line = last_line
#                         last_line = line
#             except:
#                 continue
#         return [str(rt)]
#     except:
#         return []


#file = sc.textFile("hdfs://ubuntu:9000/user/zhang/mobile/wenzhou/02-04/aa02040018/*/*")

sericalnumber = datetime.datetime.now().strftime('%y%m%d_%H%M%S')

file = sc.textFile("hdfs://ubuntu:9000/user/zhang/mobile/newdec/"+day+"/*/*WZH*_vlr_report.txt")
# file = sc.textFile("hdfs://ubuntu:9000/user/zhang/mobile/newdec/12-18/aa12182223/3_WZHGS9_m16_vlr_report.txt")

lines = file.flatMap(lambda t: t.split("|"))
record = lines.flatMap(parse)
uidgroup = record.groupBy(lambda x:x['uid'])
path_record = uidgroup.flatMap(cal_path)
# path_record = uidgroup.flatMap(cal_path)

# path_record.saveAsTextFile('hdfs://ubuntu:9000/user/zhang/tao/'+sericalnumber+'_'+part+'_path_'+day)
path_record.saveAsTextFile('hdfs://ubuntu:9000/user/zhang/tao/'+sericalnumber+'_new_path_'+day)


# # for day in ['02-04','02-05','02-06','02-07','02-08','02-09','02-10']:
# # for day in ['02-10']:
# for day in ['01-21','01-22','01-23','01-24','01-25','01-26','01-27']:

#     file = sc.textFile("hdfs://ubuntu:9000/user/zhang/mobile/wenzhou/"+day+"/*/*/*")
#     # file = sc.textFile("hdfs://ubuntu:9000/user/zhang/mobile/wenzhou/02-04/*/*/*")
#     # more_query_list = [
#     # "02-05",
#     # "02-06",
#     # "02-07",
#     # "02-08",
#     # "02-09",
#     # "02-10"
#     # ]
#     # for q in more_query_list:
#     #     file += sc.textFile("hdfs://ubuntu:9000/user/zhang/mobile/wenzhou/"+q+"/*/*/*")

#     lines = file.flatMap(lambda t: t.split("|"))
#     record = lines.flatMap(parse)
#     uidgroup = record.groupBy(lambda x:x['uid'])
#     path_record = uidgroup.flatMap(depingpong_cal_path)
#     # path_record = uidgroup.flatMap(cal_path)

#     path_record.saveAsTextFile('hdfs://ubuntu:9000/user/zhang/tao/'+sericalnumber+'_'+part+'_path_'+day)


