import limnpy, datetime
writer = limnpy.DictWriter('evan_test', "Evan's Test", keys=['date', 'x', 'y'])
rows = [{'date' : datetime.date(2012, 9, 1), 'x' : 1, 'y' : 2},
        {'date' : datetime.date(2012, 10, 1), 'x' : 7, 'y' : 9},]
for row in rows:
    writer.writerow(row)

writer.writesource()
hash(open('./datasources/evan_test.yaml').read())
hash(open('./datafiles/evan_test.csv').read())
