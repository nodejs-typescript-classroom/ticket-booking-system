local total_key = KEYS[1]..":total"
local join_key = KEYS[1]..":join"
local request_total = tonumber(ARGV[1])
local request_join = tonumber(ARGV[2])
local default_total = tonumber(ARGV[3])
local default_join = tonumber(ARGV[4])
-- initial default value
local total = redis.call("GET", total_key)
if not total then
	total = default_total
end
total = tonumber(total)
local join = redis.call("GET", join_key)
if not join then
	join = default_join
end
join = tonumber(join)
-- parse request
request_total = tonumber(request_total)
request_join = tonumber(request_join)
-- validate request
local is_valid = 1 
if request_total < 0 or request_join < 0 then 
  is_valid = 0
	return {total, join, is_valid, "request invalid"}
end
if request_join > 0 and total < request_join then 
  is_valid = 0
	return {total, join, is_valid, "total not sufficient"}
end
if request_total > 0 and request_join > 0 then 
  is_valid = 0
	return {total, join, is_valid, "request invalid"}
end
-- increase total
if request_total > 0 and request_join == 0 then
  total = total + request_total 
end
-- increase join, decrease total
if request_join > 0 and total >= join + request_join then
  join = join + request_join
end
redis.call("SET", total_key, total)
redis.call("SET", join_key, join)
return {total, join, is_valid, ""}
