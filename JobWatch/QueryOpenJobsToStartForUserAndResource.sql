-- QueryOpenJobsToStartForUserAndResource
select l.StartDate as EffStartDate,  w.ProdName, w.Status as WOStatus,l.Status as RSStatus,l.ItemCode,l.DocEntry,w.DocNum,l.LineNum,l.VisOrder + iif(rs.SeqNum is null,0,rs.SeqNum + 1) as VisOrder
, l.StartDate, 1259 as BeginTime, w.PlannedQty - w.CmpltQty as OpenQty, l.PlannedQty - l.IssuedQty as TimeToComplete
, l.StageId, isnull(rs.Name,l.ItemName) as Name, rs.SeqNum, l.ItemName, r.ResType
from WOR1 l join OWOR w on l.DocEntry = w.DocEntry
join ORSC r on l.ItemCode = r.ResCode
left outer join WOR4 rs on rs.StageId = l.StageId and rs.DocEntry = l.DocEntry
where w.Status = 'R' and IssueType = 'M' and ItemType = 290
and l.Status <> 'C'
--and l.ItemCode = 'R300005'
and l.ItemCode = '[%0]'
order by 1 -- a.Recontact, a.BeginTime