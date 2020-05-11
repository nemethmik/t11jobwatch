-- QueryRunningJobsForUser
select rs.Name as RSName, a.BeginTime, a.Recontact, rs.SeqNum, w.ProdName, w.PlannedQty - w.CmpltQty as OpenQty, l.ItemName, l.StageId, l.Status, a.Action, a.ClgCode, w.DocEntry, w.DocNum, a.U_LineNum, u.USER_CODE, u.USERID, l.ItemCode,w.Comments,l.VisOrder + iif(rs.SeqNum is null,0,rs.SeqNum + 1) as VisOrder
from OCLG a join OWOR w on a.DocEntry = w.DocEntry and a.DocType = 202
join OUSR u on a.AttendUser = u.USERID join WOR1 l on a.U_LineNum = l.LineNum and a.DocEntry = l.DocEntry
left outer join WOR4 rs on rs.DocEntry = l.DocEntry and l.StageId = rs.StageId
where w.Status = 'R' and a.Status = 1
and u.USER_CODE = '[%0]'
