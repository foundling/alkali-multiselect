echo starting live server
echo killing any pre-existing live server instances
pkill live-server
live-server

echo killing any pre-existing less-watch-compiler instances
echo less-watch-compiler 
less-watch-compiler . . entry.less

