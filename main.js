class Radio {
    static queryData(data) {
        var keys = Object.keys(data);
        var all = [];
        
        for (var i = 0;i < keys.length;i++) {
            all.push(encodeURIComponent(keys[i]) + "=" + encodeURIComponent(data[keys[i]]));
        }
        
        return all.join("&");
    }
    
    static fetch(url,data) {
        if (!url) {
            return Promise.reject("");
        }
        data = data || {};
        
        return new Promise(function(resolve,reject) {
            fetch(url + "?" + Radio.queryData(data)).then(function(data) {
                if (data.status !== 200) {
                    data.text().then(function(data) {
                        reject(data);
                    });
                } else {
                    data.text().then(function(data) {
                        resolve(data);
                    });
                }
            });
        });
    }
    
    fetch(url,data) {
        if (!url) {
            return Promise.reject("");
        }
        data = data || {};
        
        data.domain = this.domain;
        data.stream = this.stream;
        data.password = this.password;
        
        return Radio.fetch(url,data);
    }
    
    constructor(stream,password) {
        stream = stream || "";
        password = password || "";
        
        this.domain = window.location.host;
        this.stream = stream;
        this.password = password;
        this.gotten = 0;
        
        this.connect();
    }
    
    connect() {
        var me = this;
        
        return new Promise(function(resolve,reject) {
            me.fetch("https://zsnout.com/radio/connect")
                .then(function(data) {
                    if (data == "SUCCESS") {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },function(data) {
                    reject(data);
                });
        });
    }
    
    sendMessage(message) {
        var me = this;
        
        return new Promise(function(resolve,reject) {
            me.fetch("https://zsnout.com/radio/send",{message: message})
                .then(function(data) {
                    if (data == "SUCCESS") {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },function(data) {
                    reject(data);
                });
        });
    }
    
    getAllData() {
        var me = this;
        
        return new Promise(function(resolve,reject) {
            me.fetch("https://zsnout.com/radio/data")
                .then(function(data) {
                    data = JSON.parse(data);
                    
                    me.gotten = data.length;
                    resolve(data);
                },function(data) {
                    reject(data);
                });
        });
    }
    
    getNewData() {
        var me = this;
        
        return new Promise(function(resolve,reject) {
            me.fetch("https://zsnout.com/radio/data")
                .then(function(data) {
                    var orig = JSON.parse(data);
                    if (me.gotten == orig.length) {
                        resolve([]);
                        return;
                    }
                    
                    data = orig.slice(me.gotten);
                    
                    me.gotten = orig.length;
                    resolve(data);
                },function(data) {
                    reject(data);
                });
        });
    }
    
    waitForNew(time) {
        var me = this;
        
        time = Number(time) || 5000;
        if (isNaN(time)) {
            return Promise.reject("");
        } else {
            time = Math.max(time,5000);
        }
        
        return new Promise(function(resolve,reject) {
            function wait() {
                window.setTimeout(function() {
                    me.getNewData().then(function(data) {
                        if (data.length >= 1) {
                            resolve(data);
                        } else {
                            return wait();
                        }
                    },function(data) {
                        reject(data);
                    });
                },time);
            }
            
            wait();
        });
    }
    
    onNewData(func,time) {
        var me = this;
        
        time = Number(time) || 5000;
        if (isNaN(time)) {
            return Promise.reject("");
        } else {
            time = Math.max(time,5000);
        }
        
        function wait() {
            me.waitForNew(time).then(function(data) {
                func(data);
                wait();
            });
        }
    }
}
