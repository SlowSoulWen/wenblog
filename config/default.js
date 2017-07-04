module.exports = {
	port : 80,
	session : {
	    secret: 'wenblog',
	    key: 'wenblog',
	    maxAge: 2592000000		
	},
	mongodb: {
		development : {
			connection : "mongodb://localhost:27017/wenblog"
		},
		production : {
			connection : "mongodb://localhost:27017/wenblog"
		}
	}
}
