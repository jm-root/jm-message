var service = require('./lib');

service = service({
    port: 3001
});

var i = 0;
setInterval(function(){
    if(i>4) i = 0;
    service.send({
        data:{
            type: 'notice',
            data: {
                id: i++
            }
        }
    })
}, 1000);
