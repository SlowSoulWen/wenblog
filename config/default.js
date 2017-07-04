module.exports = {
	port : 8080,
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
