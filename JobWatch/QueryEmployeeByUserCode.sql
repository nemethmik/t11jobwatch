begin
declare @lang varchar;
--set @lang = '[lang]'
-- use merlina for a working example
select e.Code, e.userId, e.empID, e.lastName, e.firstName, u.USER_CODE, 'Hello' as CustomField 
from OHEM e left outer join OUSR u on e.userId = u.USERID
where u.USER_CODE = '[%0]'
end
