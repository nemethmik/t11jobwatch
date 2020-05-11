--select w.Status as WOStatus,l.Status as RSStatus,l.ItemCode,l.DocEntry,w.DocNum,l.LineNum,l.VisOrder
select r.ResCode, r.ResName, r.ResType, t.OpenJobs from
(select l.ItemCode,count(*) as OpenJobs
from WOR1 l join OWOR w on l.DocEntry = w.DocEntry
where w.Status = 'R' and IssueType = 'M' and ItemType = 290
and l.Status <> 'C' 
group by l.ItemCode) as T join ORSC r on t.ItemCode = r.ResCode
