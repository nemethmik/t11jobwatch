begin
declare @docEntry int = [%0] -- 155
declare @lineNum int = [%1] -- 4
declare @stageId int
declare @status varchar(1)
declare @remaining int
declare @anytransactions int
declare @newstatus varchar(1)
select @stageId = StageId, @status = Status from WOR1 where DocEntry = @docEntry and LineNum = @lineNum 
--select * from WOR1 where DocEntry = @docEntry and StageId = @stageId 
select @remaining = count(1) 
	from wor1 l join owor w on l.DocEntry = w.DocEntry
	where l.DocEntry = @docEntry and l.StageId = @stageId and IssueType = 'M' and
		((l.PlannedQty > l.IssuedQty and l.ItemType = 4) or (w.PlannedQty > l.U_CompletedQty and l.ItemType = 290))
select @anytransactions = count(1) 
	from wor1 l join owor w on l.DocEntry = w.DocEntry
	where l.DocEntry = @docEntry and l.StageId = @stageId and 
		(l.IssuedQty > 0 or l.U_CompletedQty > 0 or l.U_RejectedQty > 0 or l.U_ReworkQty > 0)
if @remaining = 0 set @newstatus = 'C' 
else if @anytransactions > 0 set @newstatus = 'I' 
if @status <> @newstatus and @stageId is not null and @docEntry is not null begin --Don't do anything when route stages are not used
	begin transaction
		update WOR1 set Status = @newstatus where DocEntry = @docEntry and StageId = @stageId
		update WOR4 set Status = @newstatus where DocEntry = @docEntry and StageId = @stageId
		select 'Stage Updated' as UpdateStatus, @docEntry as DocEntry, @stageId as StageId, @status as LineStatus, @remaining as OpenLinesInStage, @anytransactions as AnyTransInStage, @newstatus as NewStageStatus 
	commit transaction
end
end