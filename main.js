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
    
    static exists(stream,password) {
        return new Promise(function(resolve,reject) {
            Radio.fetch("https://zsnout.com/radio/exists",{
                domain: window.location.host,
                stream: stream,
                password: password
            })
                .then(function(data) {
                    if (data == "ERROR") {
                        reject(true);
                    } else {
                        resolve(JSON.parse(data));
                    }
                },function(data) {
                    reject(false);
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
    
    constructor(stream,password,callback,current) {
        stream = stream || "";
        password = password || "";
        
        this.domain = window.location.host;
        this.stream = stream;
        this.password = password;
        this.gotten = 0;
        
        var me = this;
        
        function connect() {
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
        
        connect().then(function(data) {
            if (!data) {
                console.error("You have unsuccessfully connected to Radio.");
                return;
            }
            console.log("You have successfully connected to Radio.");
            
            function event() {
                me.wait(function(data) {
                    callback(data);
                    event();
                });
            }
            
            if (typeof current == "function" && typeof callback == "function") {
                me.getAll().then(function(data) {
                    for (var i = 0;i < data.length;i++) {
                        current(data[i]);
                    }
                    event();
                });
            } else if (typeof current == "function") {
                me.getAll().then(function(data) {
                    for (var i = 0;i < data.length;i++) {
                        current(data[i]);
                    }
                });
            } else if (typeof callback == "function") {
                event();
            }
        },function(data) {
            console.error("You unsuccessfully connected to Radio.");
        });
    }
    
    send(message) {
        this.fetch("https://zsnout.com/radio/send",{message: message});
    }
    
    getAll() {
        var me = this;
        
        return new Promise(function(resolve,reject) {
            me.fetch("https://zsnout.com/radio/data")
                .then(function(data) {
                    if (data == "ERROR" || data == "PASSWORD") {
                        reject(data);
                    }
                    
                    data = JSON.parse(data);
                    
                    me.gotten = data.length;
                    resolve(data);
                },function(data) {
                    reject(data);
                });
        });
    }
    
    getNew() {
        var me = this;
        
        return new Promise(function(resolve,reject) {
            me.fetch("https://zsnout.com/radio/data")
                .then(function(data) {
                    if (data == "ERROR" || data == "PASSWORD") {
                        reject(data);
                    }
                    
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
    
    wait(callback) {
        if (typeof callback != "function") {
            throw new TypeError("The parameter `callback` is of the wrong type.");
        }
        
        var me = this;
        
        function waitForNew() {
            me.getNew().then(function(data) {
                if (data.length >= 1) {
                    for (var i = 0;i < data.length;i++) {
                        callback(data[i]);
                    }
                } else {
                    window.setTimeout(waitForNew,5000);
                }
            },function(data) {
                console.error("Radio.wait failed.");
            });
        }
        
        waitForNew();
    }
}
