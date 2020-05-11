-- CanUserStartOperation
-- This cannot be executed, because of the structure of the query.
begin
	declare @user_code varchar(100) = '[%0]' -- 'maria' --
	declare @lineNum int = [%1] -- 4 -- 
	declare @docEntry int = [%2] -- 155 -- 
	declare @usr int
	set @usr = (select u.USERID from OUSR u where u.USER_CODE = @user_code)
	if(@usr > 0) begin
		select @usr as USERID, l.LineNum, w.DocEntry from WOR1 l join OWOR w on l.DocEntry = w.DocEntry
		where w.Status = 'R' and l.Status in ('P','I') and w.PlannedQty > w.CmpltQty
		and l.LineNum = @lineNum and w.DocEntry = @docEntry 
	end
end
